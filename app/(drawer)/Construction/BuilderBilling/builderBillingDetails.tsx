import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { RadioButton } from "react-native-paper";
import { useDispatch } from "react-redux";
import BuilderEditForm from "./BuilderEditForm";
// import CustomerEditForm from "./CustomerEditForm";
// import DPREditForm from "./DPREditForm";
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

interface SubProject {
  id: number;
  buildingName: string;
}

interface ScopeItem {
  id: number;
  dailyProjectProgeessId: number;
  vendorId: number;
  vendor: {
    id: number;
    vendorCode: string;
    vendorName: string;
  };
  subprojectScopeId: number;
  subProjectScope: {
    scopeUOMName: string;
  };
  scopeName: string;
  scopeQty: number;
  scopeCummulativeQty: number;
  scopeCertifiedQty: number;
  scopeBalancedQty: number;
}

interface ProjectDetails {
  id: number;
  projectId: number;
  project: {
    projectName: string;
    projectNumber: string;
  };
  subProject: {
    subProjectName: string;
    dO_Number: string;
  };
  vendorMaster: {
    vendorCode: string;
    vendorName: string;
  };
  subProjectId: number;
  soNumber: string;
  runningAccountNumber: string;
  runningAccountDate: string;
  createdBy: number;
  createdDateTime: string;
  updatedBy: number | null;
  updatedDateTime: string | null;
  regStatus: string;
  status: string;
}

interface UserData {
  id: string;
}

interface ApiEquipment {
  id: number;
  dailyProjectProgeessId: number;
  subprojectEquipmentId: number;
  subProjectEquipments: {
    id: number;
    subProjectId: number;
    equipmentId: number;
    equipmentMaster: {
      id: number;
      equipmentName: string;
    };
  };
  count: number;
}

const CustomerBillingDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // State declarations
  const [tabUserName, setTabUserName] = useState<string | null>(null);
  const [tabUserRoleName, setTabUserRoleName] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jmrDate, setJmrDate] = useState(new Date());
  const [vendorCode, setVendorCode] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [soNumber, setSoNumber] = useState<string | null>(null);
  const [runningAccountNumber, setRunningAccountNumber] = useState<
    string | null
  >(null);
  const [runningAccountDate, setRunningAccountDate] = useState<Date | null>(
    null
  );
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [selectedSubProject, setSelectedSubProject] = useState<number | null>(
    null
  );
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null
  );
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
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
  const [builderMasterFlow, setBuilderMasterFlow] = useState<any[]>([]);
  const [builderFlowId, setBuilderFlowId] = useState<number | null>(null);
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
    setBuilderMasterFlow([]);
    setBuilderFlowId(null);
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
        `${API_ENDPOINTS.BUILDER_BILLING.DETAILS}?id=${encodedId}&UserId=${encodedUserId}`
      );

      const projectDetails = response.data.builder_Bill_Entry;
      const scopeItems = response.data.builder_Bill_Entry_Scopes;
      const createdBy = response.data.createdByName;
      const updatedBy = response.data.updatedByName;

      const builderMasterFlow = response.data.builder_Bill_EntryFlows;
      const builderFlowId = response.data.builder_Bill_EntryFlowLastest?.id;
      setBuilderMasterFlow(builderMasterFlow);
      setBuilderFlowId(builderFlowId);
      setCreatedBy(createdBy);
      setUpdatedBy(updatedBy);
      if (response.data.isSee === true) {
        setIsSee(true);
        setLevel(response.data.builder_Bill_EntryFlowLastest?.level);
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
      setProjectDetails(projectDetails);
      setVendorCode(projectDetails.vendorMaster.vendorCode);
      setVendorName(projectDetails.vendorMaster.vendorName);
      setSoNumber(projectDetails.sO_Number);
      setRunningAccountNumber(projectDetails.running_Acc_No);
      setRunningAccountDate(new Date(projectDetails.running_Acc_Date));

      //   "builder_Bill_Entry_Scopes": [
      //     {
      //         "id": 10,
      //         "customerId": 6,
      //         "subProjectScopeId": 9,
      //         "subProjectScope": {
      //             "scopeUOMName": "M2"
      //         },
      //         "scopeName": "Purlin & Sheeting",
      //         "scopeQty": 12000,
      //         "scopeCummulativeQty": 0,
      //         "scopeCertifiedQty": 61,
      //         "scopeBalancedQty": 11939
      //     },
      //     {
      //         "id": 11,
      //         "customerId": 6,
      //         "subProjectScopeId": 10,
      //         "subProjectScope": {
      //             "scopeUOMName": "M2"
      //         },
      //         "scopeName": "Sheeting service",
      //         "scopeQty": 11000,
      //         "scopeCummulativeQty": 0,
      //         "scopeCertifiedQty": 16,
      //         "scopeBalancedQty": 10984
      //     }
      // ],
      // Set scope items
      setScopeItems(scopeItems);
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
      { field: "actionTaken", label: "Action Taken" },
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
      formDataToSend.append("Id", builderFlowId?.toString() || "");
      formDataToSend.append("Status_to", actionFormData.actionTaken);
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
        API_ENDPOINTS.BUILDER_BILLING.FLOW_ACTION,
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
          redirectPath:
            "/(drawer)/Construction/BuilderBilling/BuilderBillingIndex",
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
        {/* Project Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.project.projectNumber || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name of Project</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={projectDetails?.project.projectName}
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
            <Text style={styles.label}>SO Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={soNumber || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Running Account Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={runningAccountNumber || ""}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Running Account Date</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={
                runningAccountDate
                  ? formatDate(new Date(runningAccountDate))
                  : ""
              }
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Created By</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={createdBy || ""}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Updated By</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={updatedBy || ""}
              editable={false}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Updated Date Time</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={
                projectDetails?.updatedDateTime
                  ? formatDateTime(projectDetails?.updatedDateTime)
                  : ""
              }
              editable={false}
            />
          </View>
        </View>

        {/* Scope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCOPE</Text>
          {scopeItems.map((item) => (
            <View key={item.id} style={styles.scopeItemContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Scope Item</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`${item.scopeName} (${item.subProjectScope.scopeUOMName})`}
                  editable={false}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`${item.subProjectScope.scopeUOMName}`}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Scope Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.scopeQty.toString()}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cumulative Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.scopeCummulativeQty.toString()}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Certified Qty</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                    item.scopeCertifiedQty &&
                    item.scopeCertifiedQty > item.scopeQty
                      ? styles.errorInput
                      : null,
                  ]}
                  value={item.scopeCertifiedQty?.toString() || ""}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Balance Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.scopeBalancedQty?.toString() || "0"}
                  editable={false}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Action Taken Remarks Section */}
        {builderMasterFlow && builderMasterFlow.length > 0 && (
          <>
            {builderMasterFlow.map((flow: any, index: number) => (
              <View key={flow.id} style={{ padding: 10 }}>
                <TouchableOpacity
                  style={
                    flow.status_to === "approve"
                      ? styles.successHeader
                      : flow.status_to === "reject"
                      ? styles.errorHeader
                      : flow.status_to === "return"
                      ? styles.infoHeader
                      : flow.status_to === "reevaluate"
                      ? styles.warningHeader
                      : styles.pendingHeader
                  }
                >
                  <Text style={styles.pendingText}>
                    {flow.userMaster.name} ({flow.roleMaster.roleName}) Remarks
                  </Text>
                </TouchableOpacity>

                {flow.updatedBy === 0 && (
                  <Text style={styles.pendingText}>
                    Auto Forwarded By System
                  </Text>
                )}

                {flow.level !== 0 && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Action Taken</Text>
                      <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={
                          flow.status_to === "approve"
                            ? "Approved"
                            : flow.status_to === "reject"
                            ? "Rejected"
                            : flow.status_to === "return"
                            ? "Returned"
                            : "Re-evaluated"
                        }
                        editable={false}
                      />
                    </View>
                  </>
                )}

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

                {flow.level !== 0 && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Uploaded Document</Text>
                      {flow.document ? (
                        <FilePreview
                          file={{
                            uri: `${baseURL}/uploads/Builder_FlowActionfiles/${flow.document}`,
                            name: flow.document,
                            type: "application/pdf",
                          }}
                        />
                      ) : (
                        <Text style={styles.noDocumentsText}>
                          No Documents Uploaded
                        </Text>
                      )}
                    </View>
                  </>
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
            <Text style={styles.label}>Action Taken</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioRow}>
                <RadioButton
                  value="approve"
                  status={
                    actionFormData.actionTaken === "approve"
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() =>
                    setActionFormData({
                      ...actionFormData,
                      actionTaken: "approve",
                    })
                  }
                />
                <Text style={styles.radioLabel}>Approve</Text>
              </View>

              {level === 1 && (
                <>
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="reject"
                      status={
                        actionFormData.actionTaken === "reject"
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() =>
                        setActionFormData({
                          ...actionFormData,
                          actionTaken: "reject",
                        })
                      }
                    />
                    <Text style={styles.radioLabel}>Reject</Text>
                  </View>
                  <View style={styles.radioRow}>
                    <RadioButton
                      value="reevaluate"
                      status={
                        actionFormData.actionTaken === "reevaluate"
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() =>
                        setActionFormData({
                          ...actionFormData,
                          actionTaken: "reevaluate",
                        })
                      }
                    />
                    <Text style={styles.radioLabel}>Re-evaluate</Text>
                  </View>
                </>
              )}

              {level && level > 1 && (
                <View style={styles.radioRow}>
                  <RadioButton
                    value="return"
                    status={
                      actionFormData.actionTaken === "return"
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() =>
                      setActionFormData({
                        ...actionFormData,
                        actionTaken: "return",
                      })
                    }
                  />
                  <Text style={styles.radioLabel}>Return</Text>
                </View>
              )}
            </View>

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

        {/* When level is equal to 0 */}
        {isSee && level === 0 && (
          <>
            {/* Pending With */}
            <TouchableOpacity activeOpacity={0.8} style={styles.pendingHeader}>
              <Text style={styles.pendingText}>
                Pending with {tabUserName || "Unknown User"} (
                {tabUserRoleName || "Unknown Role"})
              </Text>
            </TouchableOpacity>

            <BuilderEditForm
              id={projectDetails?.id || 0}
              builderFlowId={builderFlowId || 0}
              initialData={{
                projectId: projectDetails?.projectId || 0,
                projectNumber: projectDetails?.project?.projectNumber || "",
                subProjectNumber: projectDetails?.subProject?.dO_Number || "",
                subProjectName:
                  projectDetails?.subProject?.subProjectName || "",
                vendorCode: projectDetails?.vendorMaster.vendorCode || "",
                vendorName: projectDetails?.vendorMaster.vendorName || "",
                soNumber: soNumber || "",
                runningAccountNumber: runningAccountNumber || "",
                runningAccountDate: runningAccountDate || new Date(),
                scopeItems: scopeItems.map((item) => ({
                  id: item.id,
                  scopeName: item.scopeName,
                  scopeUOMName: item.subProjectScope.scopeUOMName,
                  scopeQty: item.scopeQty,
                  scopeCummulativeQty: item.scopeCummulativeQty,
                  scopeCertifiedQty: item.scopeCertifiedQty,
                  scopeBalancedQty: item.scopeBalancedQty,
                })),
              }}
              isSubmitting={isSubmitting}
            />
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
  noDocumentsText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },

  successHeader: {
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoHeader: {
    backgroundColor: COLORS.info,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorHeader: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningHeader: {
    backgroundColor: COLORS.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default CustomerBillingDetails;
