import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox, Switch } from "react-native-paper";
import { useDispatch } from "react-redux";

interface ProjectNo {
  value: number;
  text: string;
}

interface DprSubmitResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface AttendanceItem {
  id: number;
  cwId: number;
  cwName: string;
  inTime: string;
  isChecked: number;
  outTime: string;
  workingHours: string;
}

interface ProjectDetails {
  id: number;
  projectId: number;
  projectMaster: {
    projectName: string;
    projectNumber: string;
  };
  subProjectMaster: {
    subProjectName: string;
  };
  vendorMaster: {
    vendorCode: string;
    vendorName: string;
  };
  createdDateTime: string;
}

interface UserData {
  id: string;
}

// Add new interface for attendance action
interface AttendanceActionProps {
  item: AttendanceItem;
  isSee: boolean;
  parentId: number | null;
  onStatusChange: (success: boolean, message: string) => void;
  level: number | null;
}

// Add new component for attendance action
const AttendanceAction: React.FC<AttendanceActionProps> = ({
  item,
  isSee,
  parentId,
  onStatusChange,
  level,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(item.isChecked === 1);
  const dispatch = useDispatch();

  // Update local state when item changes
  useEffect(() => {
    setIsApproved(item.isChecked === 1);
  }, [item.isChecked]);

  const handleToggle = async (value: boolean) => {
    if (!parentId) return;
    console.log({
      parentId: parentId.toString(),
      childId: item.id.toString(),
      cwId: item.cwId.toString(),
      isApproved: value,
    });
    setIsLoading(true);
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.ATTENDANCE.UPDATE_ATTENDANCE,
        {
          parentId: parentId.toString(),
          childId: item.id.toString(),
          cwId: item.cwId.toString(),
          isApproved: value,
        }
      );

      if (response.data.success) {
        setIsApproved(value); // Update local state on success
        onStatusChange(
          true,
          response.data.message || "Attendance status updated successfully"
        );
      } else {
        setIsApproved(!value); // Revert local state on failure
        onStatusChange(
          false,
          response.data.message || "Failed to update attendance status"
        );
      }
    } catch (error: any) {
      setIsApproved(!value); // Revert local state on error
      onStatusChange(
        false,
        error.response?.data?.message || "Failed to update attendance status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return COLORS.error;
      case 1:
        return COLORS.success;
      default:
        return COLORS.warning;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Rejected";
      case 1:
        return "Approved";
      default:
        return "Pending";
    }
  };

  if (isSee) {
    if (level === 1) {
      return (
        <View style={styles.actionContainer}>
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, { color: COLORS.error }]}>
              Reject
            </Text>
            <Switch
              value={isApproved}
              onValueChange={handleToggle}
              disabled={isLoading}
              color={COLORS.success}
              style={styles.toggleSwitch}
            />
            <Text style={[styles.toggleLabel, { color: COLORS.success }]}>
              Approve
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.actionContainer}>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: getStatusColor(item.isChecked) },
            ]}
          >
            <Text style={styles.statusBoxText}>
              {getStatusText(item.isChecked)}
            </Text>
          </View>
        </View>
      );
    }
  }

  return (
    <View
      style={[
        styles.statusContainer,
        { backgroundColor: getStatusColor(item.isChecked) },
      ]}
    >
      <Text style={styles.statusText}>{getStatusText(item.isChecked)}</Text>
    </View>
  );
};

const AttendanceDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // State declarations
  const [tabUserName, setTabUserName] = useState<string | null>(null);
  const [tabUserRoleName, setTabUserRoleName] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jmrDate, setJmrDate] = useState(new Date());
  const [totalIn, setTotalIn] = useState<string | null>(null);
  const [totalOut, setTotalOut] = useState<string | null>(null);
  const [avgWorkingHours, setAvgWorkingHours] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null
  );
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [attendanceItems, setAttendanceItems] = useState<AttendanceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
    onClose?: () => void;
    redirect?: boolean;
    redirectPath?: string;
  }>({
    visible: false,
    message: "",
    type: "info",
  });
  const [selectedDocument, setSelectedDocument] = useState<FileData | null>(
    null
  );
  const [isSee, setIsSee] = useState(false);
  const [actionFormData, setActionFormData] = useState({
    actionTaken: "",
    remarks: "",
    observedBy: "",
    escalationDate: "",
  });
  const [level, setLevel] = useState<number | null>(null);
  const [attendanceMasterFlow, setAttendanceMasterFlow] = useState<any[]>([]);
  const [attendanceFlowId, setAttendanceFlowId] = useState<number | null>(null);
  const [cwParentId, setCwParentId] = useState<number | null>(null);
  const [autoSlgTargetDate, setAutoSlgTargetDate] = useState<string | null>(
    null
  );
  const [vendor, setVendor] = useState<any[]>([]);
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        try {
          dispatch(showLoading());
          resetStates();
          await loadUserData();
          if (userData?.id) {
            await fetchProjectDetails();
          }
        } catch (error) {
          console.error("Error initializing:", error);
        } finally {
          dispatch(hideLoading());
        }
      };

      initialize();
    }, [id, userData?.id])
  );

  const resetStates = () => {
    setProjectDetails(null);
    setAttendanceMasterFlow([]);
    setAttendanceFlowId(null);
    setIsSee(false);
    setActionFormData({
      actionTaken: "",
      remarks: "",
      observedBy: "",
      escalationDate: "",
    });
    setLevel(null);
    setTabUserName(null);
    setTabUserRoleName(null);
    setSelectedDocument(null);
  };

  const fetchProjectDetails = async () => {
    if (!userData?.id) {
      console.log("Waiting for user data to be loaded...");
      return;
    }

    if (!id) {
      console.log("No ID provided");
      return;
    }
    try {
      const encodedId = id;
      const encodedUserId = Buffer.from(
        userData.id.toString(),
        "utf-8"
      ).toString("base64");
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.ATTENDANCE.DETAILS}?id=${encodedId}&UserId=${encodedUserId}`
      );

      const fetchdAttendanceDetails = response.data.cW_AttendanceSheet_Parent;
      const attendanceItems = response.data.attendanceSheet;
      const createdBy = response.data.createdByName;
      const updatedBy = response.data.updatedByName;
      const attendanceMasterFlow = response.data.cW_Attendance_Flows;
      const attendanceFlowId = response.data.cW_Attendance_Flow_latest?.id;
      setAttendanceMasterFlow(attendanceMasterFlow);
      setAttendanceFlowId(attendanceFlowId);
      setCwParentId(response.data.cW_AttendanceSheet_Parent?.id);
      setCreatedBy(createdBy);
      setUpdatedBy(updatedBy);
      if (response.data.isSee === true) {
        setIsSee(true);
        setLevel(response.data.cW_Attendance_Flow_latest?.level);
        setTabUserName(response.data.tabUserName);
        setTabUserRoleName(response.data.tabUserRoleName);

        // Format and set the autoSlgTargetDate
        if (response.data.autoSlgTargetDate) {
          const date = new Date(response.data.autoSlgTargetDate);
          const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          setAutoSlgTargetDate(formattedDate);
        }

        // Set action form data with initial values
        setActionFormData((prev) => ({
          ...prev,
          observedBy: response.data.tabUserName || "",
          escalationDate: response.data.autoSlgTargetDate
            ? new Date(response.data.autoSlgTargetDate).toLocaleDateString(
                "en-GB"
              )
            : "",
        }));
      }

      // Set project details
      setProjectDetails(fetchdAttendanceDetails);
      setTotalIn(response.data.totalIn?.toString() || "");
      setTotalOut(response.data.totalOut?.toString() || "");
      setAvgWorkingHours(
        response.data.averageWorkingDuration?.toString() || ""
      );

      //   "attendanceSheet": [
      //     {
      //         "id": 1,
      //         "cwId": 9,
      //         "cwName": "ABC 123",
      //         "inTime": "04:34 PM",
      //         "isChecked": 2,
      //         "outTime": "04:36 PM",
      //         "workingHours": "0.02"
      //     },
      //     {
      //         "id": 2,
      //         "cwId": 10,
      //         "cwName": "Robin Lang",
      //         "inTime": "05:09 PM",
      //         "isChecked": 2,
      //         "outTime": "05:10 PM",
      //         "workingHours": "0.02"
      //     }
      // ],
      // Set attendance items
      setAttendanceItems(attendanceItems);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Failed to load project details. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const pickDocument = async (setFile: (file: FileData | null) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleViewDocument = async (file: FileData) => {
    try {
      const supported = await Linking.canOpenURL(file.uri);
      if (supported) {
        await Linking.openURL(file.uri);
      } else {
        Alert.alert("Error", "Cannot open this file type");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      Alert.alert("Error", "Failed to open document");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "remarks", label: "Remarks" },
      { field: "observedBy", label: "Observed By" },
      { field: "escalationDate", label: "Escalation Date" },
    ];

    for (const { field, label } of requiredFields) {
      if (!actionFormData[field as keyof typeof actionFormData]) {
        Alert.alert("Validation Error", `${label} is required`);
        return false;
      }
    }

    return true;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(showLoading());
      setError(null);

      const formDataToSend = new FormData();

      // Add required fields
      formDataToSend.append("Id", attendanceFlowId?.toString() || "");
      formDataToSend.append("ActionTaken", actionFormData.remarks);
      formDataToSend.append("AutoSLgTargetDate", autoSlgTargetDate || "");

      // Add document if selected
      if (selectedDocument) {
        formDataToSend.append("Document", {
          uri: selectedDocument.uri,
          name: selectedDocument.name,
          type: selectedDocument.type,
        } as any);
      }

      // Add encrypted user ID
      if (userData?.id) {
        const encodedUserId = Buffer.from(
          userData.id.toString(),
          "utf-8"
        ).toString("base64");
        formDataToSend.append("UpdatedBy", encodedUserId);
      }

      console.log("formDataToSend", formDataToSend);

      const response = await httpClient.post<DprSubmitResponse>(
        API_ENDPOINTS.ATTENDANCE.FLOW_ACTION,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
          redirect: true,
          redirectPath: "/(drawer)/Construction/attendanceView",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to submit action",
          type: "error",

          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      }
    } catch (error: any) {
      console.error("Error submitting action:", error);
      setAlert({
        visible: true,
        message: error.response?.data?.message || "Failed to submit action",
        type: "error",
        onClose: () => {
          setAlert((prev) => ({ ...prev, visible: false }));
        },
      });
    } finally {
      setIsSubmitting(false);
      dispatch(hideLoading());
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Loader />
      <ScrollView style={styles.container}>
        {/* Attendance Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.projectMaster.projectNumber || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name of Project</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.projectMaster.projectName}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vendor Code</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.vendorMaster.vendorCode || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vendor Name</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.vendorMaster.vendorName}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total In</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={totalIn || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Out</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={totalOut || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Avg Working Hours</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={avgWorkingHours || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Created Date Time</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formatDateTime(projectDetails?.createdDateTime || "")}
              editable={false}
            />
          </View>
        </View>

        {/* Attendance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Sheet</Text>
          <Text style={styles.sectionTitle}>Attendance Sheet</Text>
          <View style={styles.checkboxContainer}>
            <Checkbox.Item label="Select All" status="checked" />
          </View>
          {attendanceItems.map((item) => (
            <View key={item.id} style={styles.attendanceCard}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>CW Name:</Text>
                <Text style={styles.cardValue}>{item.cwName}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>In Time:</Text>
                <Text style={styles.cardValue}>{item.inTime}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Out Time:</Text>
                <Text style={styles.cardValue}>{item.outTime}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Working Hours:</Text>
                <Text style={styles.cardValue}>{item.workingHours}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Action:</Text>
                <View style={styles.actionContainer}>
                  <AttendanceAction
                    item={item}
                    isSee={isSee}
                    parentId={cwParentId}
                    level={level}
                    onStatusChange={(success, message) => {
                      setAlert({
                        visible: true,
                        message: message,
                        type: success ? "success" : "error",
                        onClose: () => {
                          setAlert((prev) => ({ ...prev, visible: false }));
                        },
                      });
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Taken Remarks Section */}
        {attendanceMasterFlow && attendanceMasterFlow.length > 0 && (
          <>
            {attendanceMasterFlow.map((flow: any, index: number) => (
              <View key={flow.id} style={{ padding: 10 }}>
                <TouchableOpacity style={styles.pendingHeader}>
                  <Text style={styles.pendingText}>
                    {flow.userMaster.name} ({flow.roleMaster.roleName}) Remarks
                  </Text>
                </TouchableOpacity>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Remarks</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={flow.actionTaken}
                    editable={false}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Action Taken Date Time</Text>
                  <TextInput
                    style={styles.input}
                    value={formatDateTime(flow.actionTakenDatetime)}
                    editable={false}
                  />
                </View>

                {flow.document && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Uploaded Document</Text>
                    <FilePreview
                      file={{
                        uri: `${baseURL}/uploads/CWAttendancefiles/${flow.document}`,
                        name: flow.document,
                        type: "application/pdf",
                      }}
                    />
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* do below section only if isSee is true and keep in different return block */}
        {isSee && level !== 0 && (
          <>
            {/* Pending With */}
            <TouchableOpacity activeOpacity={0.8} style={styles.pendingHeader}>
              <Text style={styles.pendingText}>
                Pending with {tabUserName || "Unknown User"} (
                {tabUserRoleName || "Unknown Role"})
              </Text>
            </TouchableOpacity>

            {/* Action Taken */}

            {/* Remarks */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={actionFormData.remarks}
                onChangeText={(text) =>
                  setActionFormData({ ...actionFormData, remarks: text })
                }
                placeholder="Type Action Taken Details..."
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Upload Document</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickDocument(setSelectedDocument)}
              >
                <Text style={styles.uploadButtonText}>Choose File</Text>
              </TouchableOpacity>
              {selectedDocument && <FilePreview file={selectedDocument} />}
            </View>

            {/* Observed By */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Observed By</Text>
              <TextInput
                value={tabUserName || ""}
                editable={false}
                style={styles.input}
              />
            </View>

            {/* Escalation Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Escalation Date</Text>
              <TextInput
                value={autoSlgTargetDate || ""}
                editable={false}
                style={styles.input}
              />
            </View>

            {/* Submit */}
            {isSubmitting ? (
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <CustomButton
                    title="Submitting..."
                    onPress={() => {}}
                    variant="primary"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <CustomButton
                    title="Submit"
                    onPress={() => handleSubmit()}
                    variant="primary"
                    disabled={isSubmitting}
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* Add CustomAlert at the end of the component */}
        <CustomAlert
          visible={alert.visible}
          message={alert.message}
          type={alert.type}
          onClose={() => {
            setAlert((prev) => ({ ...prev, visible: false }));
          }}
          redirect={alert.redirect}
          redirectPath={alert.redirectPath}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: COLORS.background,
    padding: 2,
    marginBottom: SIZES.xlarge,
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 5,
    padding: SIZES.small,
    backgroundColor: COLORS.background,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "700",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.medium,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.medium,
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  infoContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    color: "#555",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.gray,
    padding: 12,
  },
  tableHeaderText: {
    flex: 1,
    color: COLORS.background,
    fontWeight: "500",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    padding: 12,
  },
  tableCell: {
    flex: 1,
    fontSize: SIZES.medium,
  },
  tableCellInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 4,
    padding: 8,
    textAlign: "center",
  },
  buttonContainer: {
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 50,
  },
  datePicker: {
    width: "100%",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    alignItems: "center",
  },
  uploadButtonText: {
    color: COLORS.background,
    ...FONTS.medium,
  },
  scopeItemContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
    padding: 12,
  },
  errorInput: {
    borderColor: "red",
    color: "red",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pendingHeader: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pendingText: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.white,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
  },
  buttonWrapper: {
    flex: 1,
  },
  actionContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  statusContainer: {
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    minWidth: 100,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  attendanceCard: {
    backgroundColor: "#f5f8ff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardLabel: {
    fontWeight: "600",
    color: COLORS.text,
    minWidth: 120,
    fontSize: SIZES.medium,
    lineHeight: 20,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  toggleLabel: {
    fontSize: SIZES.medium,
    fontWeight: "500",
  },
  toggleSwitch: {
    marginHorizontal: 8,
  },
  statusBox: {
    padding: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBoxText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: SIZES.medium,
  },
});

export default AttendanceDetails;
