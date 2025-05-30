import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import { MaterialIcons } from "@expo/vector-icons";
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

interface AttendanceUpdate {
  parentId: number;
  childId: number;
  cwId: number;
  isApproved: boolean;
}

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [attendanceUpdate, setAttendanceUpdate] = useState<AttendanceUpdate[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);

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

      // First handle attendance update if there are items to update
      if (attendanceUpdate.length > 0) {
        try {
          const attendanceResponse = await httpClient.post(
            API_ENDPOINTS.ATTENDANCE.UPDATE_ATTENDANCE,
            {
              AttendanceList: attendanceUpdate.map((item) => ({
                parentId: item.parentId.toString(),
                childId: item.childId.toString(),
                cwId: item.cwId.toString(),
                isApproved: item.isApproved,
              })),
            }
          );

          if (!attendanceResponse.data.success) {
            throw new Error(
              attendanceResponse.data.message ||
                "Failed to update attendance status"
            );
          }
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message ||
              "Failed to update attendance status"
          );
        }
      }

      // Then proceed with the form submission
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

  // Initialize selected items based on isChecked
  useEffect(() => {
    const initialSelectedIds = attendanceItems
      .filter((item) => item.isChecked === 1)
      .map((item) => item.id);

    const initialUpdates = attendanceItems.map((item) => ({
      parentId: cwParentId || 0,
      childId: item.id,
      cwId: item.cwId,
      isApproved: item.isChecked === 1,
    }));

    setSelectedIds(initialSelectedIds);
    setAttendanceUpdate(initialUpdates);
    setSelectAll(initialSelectedIds.length === attendanceItems.length);
  }, [attendanceItems, cwParentId]);

  const handleSelectAll = () => {
    if (!selectAll) {
      // Select all items
      const allUpdates = attendanceItems.map((item) => ({
        parentId: cwParentId || 0,
        childId: item.id,
        cwId: item.cwId,
        isApproved: true,
      }));
      setAttendanceUpdate(allUpdates);
      setSelectedIds(attendanceItems.map((item) => item.id));
    } else {
      // Deselect all items
      const allUpdates = attendanceItems.map((item) => ({
        parentId: cwParentId || 0,
        childId: item.id,
        cwId: item.cwId,
        isApproved: false,
      }));
      setAttendanceUpdate(allUpdates);
      setSelectedIds([]);
    }
    setSelectAll(!selectAll);
  };

  const handleItemSelect = (item: AttendanceItem) => {
    const isSelected = selectedIds.includes(item.id);
    let newSelectedIds: number[];
    let newAttendanceUpdate: AttendanceUpdate[];

    if (isSelected) {
      // Remove item from selection
      newSelectedIds = selectedIds.filter((id) => id !== item.id);
      newAttendanceUpdate = attendanceUpdate.map((update) =>
        update.childId === item.id ? { ...update, isApproved: false } : update
      );
    } else {
      // Add item to selection
      newSelectedIds = [...selectedIds, item.id];
      newAttendanceUpdate = attendanceUpdate.map((update) =>
        update.childId === item.id ? { ...update, isApproved: true } : update
      );
    }

    setSelectedIds(newSelectedIds);
    setAttendanceUpdate(newAttendanceUpdate);
    setSelectAll(newSelectedIds.length === attendanceItems.length);
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

  return (
    <View style={styles.mainContainer}>
      <Loader />
      <ScrollView
        style={styles.container}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
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
          <View
            style={[
              styles.checkboxContainer,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
                marginRight: 15,
              },
            ]}
          >
            {isSee && level === 1 && (
              <>
                <Text style={[styles.checkboxLabel, { marginRight: 10 }]}>
                  Select All
                </Text>
                <TouchableOpacity
                  style={[
                    styles.customCheckbox,
                    selectAll && styles.checkedCheckbox,
                  ]}
                  onPress={handleSelectAll}
                >
                  {selectAll && (
                    <MaterialIcons name="check" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <View
            style={[
              styles.attendanceScrollContainer,
              {
                height:
                  attendanceItems.length <= 3
                    ? styles.attendanceCard.height * attendanceItems.length + 50
                    : 550,
              },
            ]}
          >
            <ScrollView
              style={styles.attendanceScrollView}
              showsVerticalScrollIndicator={attendanceItems.length > 3}
              contentContainerStyle={styles.attendanceScrollContent}
              nestedScrollEnabled={true}
              scrollEnabled={attendanceItems.length > 3}
            >
              {attendanceItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.attendanceCard,
                    {
                      height: level !== 1 ? 200 : 150,
                    },
                  ]}
                >
                  {isSee && level === 1 && (
                    <View style={styles.checkboxContainer}>
                      <TouchableOpacity
                        style={[
                          styles.customCheckbox,
                          selectedIds.includes(item.id) &&
                            styles.checkedCheckbox,
                          !isSee && styles.disabledCheckbox,
                        ]}
                        onPress={() => isSee && handleItemSelect(item)}
                        disabled={!isSee}
                      >
                        {selectedIds.includes(item.id) && (
                          <MaterialIcons name="check" size={18} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
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
                  {level !== 1 && (
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Action:</Text>
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
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {isSee && level === 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: 10,
                paddingHorizontal: 15,
              }}
            >
              <Text style={[styles.checkboxLabel]}>
                Selected: {selectedIds.length} of {attendanceItems.length}
              </Text>
            </View>
          )}
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
                    style={[
                      styles.input,
                      styles.multilineInput,
                      styles.disabledInput,
                    ]}
                    value={flow.actionTaken}
                    editable={false}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Action Taken Date Time</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
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
                style={[styles.input, styles.disabledInput]}
              />
            </View>

            {/* Escalation Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Escalation Date</Text>
              <TextInput
                value={autoSlgTargetDate || ""}
                editable={false}
                style={[styles.input, styles.disabledInput]}
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
                    title="Approve & Submit"
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
  checkboxContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  checkedCheckbox: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: SIZES.medium,
    color: COLORS.text,
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
    marginVertical: 10,
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
    height: 200,
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
  attendanceScrollContainer: {
    marginVertical: 10,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  attendanceScrollView: {
    flex: 1,
  },
  attendanceScrollContent: {
    padding: 10,
  },
  disabledCheckbox: {
    opacity: 0.5,
    borderColor: COLORS.gray,
  },
});

export default AttendanceDetails;
