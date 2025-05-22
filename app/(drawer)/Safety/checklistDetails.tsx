import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
import { useDispatch } from "react-redux";

interface UserData {
  id: string;
}
interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface TpiChecklist {
  id: number;
  equipmentMasterId: number;
  tpiExpiryDate: string;
  proofDocuments: string;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdDatetime: string;
  updatedDatetime: string;
}

interface EquipmentFrequencyChecklist {
  id: number;
  equipmentId: number;
  dateofInspection: string;
  inspectionBY: number;
  proofDocument: string | null;
  remarks: string;
  createdDatetime: string;
}

interface EquipmentFrequencyChecklistChild {
  id: number;
  equipmentFrequencyChecklistId: number;
  checklistName: string;
  result: string;
  remarks: string;
  proofDocument: string | null;
}

interface EquipmentFrequencyChecklistTable {
  equipmentFrequencyChecklists: EquipmentFrequencyChecklist[];
  equipmentFrequencyChecklistChild: EquipmentFrequencyChecklistChild[];
  inspectedBYName: string;
}

interface EquipmentCategoryChecklistChild {
  checklistName: string;
  result: string;
  remarks: string;
  uploadedDocument: string | null;
}

interface EquipmentCategoryChecklist {
  id: number;
  categoryId: number;
  checkList: string;
  result?: string;
  remarks?: string;
  uploadedDocument?: string | null;
}

const ChecklistDetails = () => {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tpiExpiryDate, setTpiExpiryDate] = useState(new Date());
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();

  const [equipmentDetails, setEquipmentDetails] = useState({
    equipmentId: "",
    referenceNo: "",
    equipmentCategory: "",
    equipmentName: "",
    frequency: "",
    zone: "",
    location: "",
    alert: "",
    proof: "",
    status: "",
  });

  const [proofUploaded, setProofUploaded] = useState<FileData[]>([]);
  const [attachments, setAttachments] = useState<FileData | null>(null);

  const [tpiInfoDetails, setTpiInfoDetails] = useState<TpiChecklist[]>([]);
  const [additionalRemarks, setAdditionalRemarks] = useState("");

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
    redirect: false,
    redirectPath: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checklistTables, setChecklistTables] = useState<
    EquipmentFrequencyChecklistTable[]
  >([]);
  const [expandedChecklistIndex, setExpandedChecklistIndex] = useState<
    number | null
  >(null);

  const [equipmentCategoryChecklist, setEquipmentCategoryChecklist] = useState<
    EquipmentCategoryChecklist[]
  >([]);

  const [tpiFormData, setTpiFormData] = useState({
    equipmentId: "",
    tpiExpiryDate: "",
  });

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const [selectedTpiDocument, setSelectedTpiDocument] =
    useState<FileData | null>(null);

  const resetForm = () => {
    const resetChecklist = equipmentCategoryChecklist.map((item) => ({
      ...item,
      result: "",
      remarks: "",
      uploadedDocument: null,
    }));
    setEquipmentCategoryChecklist(resetChecklist);
    setAdditionalRemarks("");
    setAttachments(null);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const formatDateToSend = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const onTpiExpiryDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTpiExpiryDate(selectedDate);
      setTpiFormData({
        ...tpiFormData,
        tpiExpiryDate: formatDateToSend(selectedDate),
      });
    }
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
        setAdditionalRemarks("");
        setAttachments(null);
        try {
          dispatch(showLoading());
          await loadUserData();
          if (userData?.id) {
            await fetchTpiDetails();
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

  const fetchTpiDetails = async () => {
    if (!userData?.id) {
      console.log("Waiting for user data to be loaded...");
      return;
    }

    if (!id) {
      console.log("No TPI ID provided");
      return;
    }
    try {
      dispatch(showLoading());
      const encodedId = id;
      const encodedUserId = Buffer.from(
        userData.id.toString(),
        "utf-8"
      ).toString("base64");
      console.log(
        `${API_ENDPOINTS.SAFETY.TPI_DETAILS}?id=${encodedId}&UserId=${encodedUserId}&tpi=0`
      );
      const response = await httpClient.get(
        `${API_ENDPOINTS.SAFETY.TPI_DETAILS}?id=${encodedId}&UserId=${encodedUserId}&tpi=0`
      );
      const equipmentDetails = response.data.equipmentMaster;
      const tpiInfoDetails = response.data.equipmentTPIChecklists;
      setEquipmentDetails(equipmentDetails);
      setTpiInfoDetails(tpiInfoDetails);
      setChecklistTables(response.data.equipmentFrequencyChecklistTables || []);
      setEquipmentCategoryChecklist(
        response.data.equipmentCategoryChecklists || []
      );
      if (equipmentDetails.proofUploadDocuments) {
        const files = equipmentDetails.proofUploadDocuments
          .split(",")
          .map((fileName: string) => ({
            uri: `${baseURL}/uploads/Equipmentsfiles/${fileName.trim()}`,
            name: fileName.trim(),
            type: fileName.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg",
          }));
        setProofUploaded(files);
      }

      //Set equipment details
      setEquipmentDetails({
        equipmentId: equipmentDetails.id || "",
        referenceNo: equipmentDetails.referenceNo || "",
        equipmentCategory: equipmentDetails.equipmentCategory.category || "",
        equipmentName: equipmentDetails.equipmentName || "",
        frequency: equipmentDetails.frequency || "",
        zone: equipmentDetails.locationMaster.zoneName || "",
        location: equipmentDetails.locationMaster.locationName || "",
        alert: equipmentDetails.alertEmail ? "Yes" : "No",
        proof: equipmentDetails.proofUpload ? "Yes" : "No",
        status: equipmentDetails.status || "",
      });

      //Set tpi info details
      setTpiInfoDetails(tpiInfoDetails);
    } catch (error) {
      console.log(error);
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
    // Validate additional remarks
    if (!additionalRemarks.trim()) {
      Alert.alert("Validation Error", "Additional Remarks is required");
      return false;
    }

    // Validate checklist items
    if (equipmentCategoryChecklist.length === 0) {
      Alert.alert("Validation Error", "No checklist items found");
      return false;
    }

    // Check if all checklist items have required fields
    for (let i = 0; i < equipmentCategoryChecklist.length; i++) {
      const item = equipmentCategoryChecklist[i];

      if (!item.result) {
        Alert.alert(
          "Validation Error",
          `Please select a result for checklist item: ${item.checkList}`
        );
        return false;
      }

      if (!item.remarks?.trim()) {
        Alert.alert(
          "Validation Error",
          `Please enter remarks for checklist item: ${item.checkList}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userData?.id) {
      console.log("Waiting for user data to be loaded...");
      return;
    }
    try {
      setIsSubmitting(true);
      dispatch(showLoading());

      const formDataToSend = {
        EquipmentId: equipmentDetails.equipmentId,
        AdditionalRemarks: additionalRemarks,
        CreatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
      };

      const multipartFormData = new FormData();

      // Add all text fields
      Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          multipartFormData.append(key, value.toString());
        }
      });

      // Add checklist items data
      equipmentCategoryChecklist.forEach((checklist, index) => {
        multipartFormData.append(
          `ChecklistItems[${index}].ChecklistName`,
          checklist.checkList
        );
        multipartFormData.append(
          `ChecklistItems[${index}].Result`,
          checklist.result || ""
        );
        multipartFormData.append(
          `ChecklistItems[${index}].Remarks`,
          checklist.remarks || ""
        );

        // Add uploaded file for each checklist item if exists
        if (checklist.uploadedDocument) {
          const fileToUpload = {
            uri: checklist.uploadedDocument,
            type: "application/octet-stream",
            name: checklist.uploadedDocument.split("/").pop() || "",
          };
          multipartFormData.append(
            `ChecklistItems[${index}].UploadFiles`,
            fileToUpload as any
          );
        }
      });

      // Add main attachment if exists
      if (attachments) {
        const fileToUpload = {
          uri: attachments.uri,
          type: attachments.type,
          name: attachments.name,
        };
        multipartFormData.append("Attachments", fileToUpload as any);
      }

      console.log("Form data being sent:", formDataToSend);
      console.log("Checklist items:", equipmentCategoryChecklist);
      console.log("Attachments:", attachments);

      const response = await httpClient.post(
        API_ENDPOINTS.SAFETY.CHECKLIST_SUBMIT,
        multipartFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        resetForm();
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
          redirect: true,
          redirectPath: "/(drawer)/Safety/checklist",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to submit action",
          type: "error",
          redirect: true,
          redirectPath: "/(drawer)/Safety/checklist",
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
    <ScrollView style={styles.container}>
      {/* General Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference No</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Enter Reference No"
            value={equipmentDetails.referenceNo}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Category</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Enter Equipment Category"
            value={equipmentDetails.equipmentCategory}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Name</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Enter Equipment Name"
            value={equipmentDetails.equipmentName}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.frequency}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Zone</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.zone}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.location}
            editable={false}
          />
        </View>
      </View>

      {/* Other Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Alert (Email/SMS)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.alert}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.proof}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof Uploaded</Text>
          <View style={styles.proofGrid}>
            {proofUploaded && proofUploaded.length > 0 ? (
              proofUploaded.map((proof, index) => (
                <View key={index} style={styles.proofItem}>
                  <FilePreview file={proof} />
                </View>
              ))
            ) : (
              <Text style={styles.noDocumentsText}>No Documents Uploaded</Text>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={equipmentDetails.status}
            editable={false}
          />
        </View>
      </View>

      {/* TPI Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TPI Information</Text>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>TPI Expiry Date</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Status</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Documents</Text>
            </View>
          </View>

          {tpiInfoDetails.map((tpi, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellText}>
                  {new Date(tpi.tpiExpiryDate).toLocaleDateString("en-GB")}
                </Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellText}>{tpi.status}</Text>
              </View>
              <View style={styles.tableCell}>
                {tpi.proofDocuments ? (
                  <View style={styles.tpiProofGrid}>
                    {tpi.proofDocuments
                      .split(",")
                      .map((fileName: string, fileIndex: number) => {
                        const file = {
                          uri: `${baseURL}/uploads/Equipmentsfiles/${fileName.trim()}`,
                          name: fileName.trim(),
                          type: fileName.toLowerCase().endsWith(".pdf")
                            ? "application/pdf"
                            : "image/jpeg",
                        };
                        return (
                          <TouchableOpacity
                            key={fileIndex}
                            style={styles.tpiProofItem}
                            onPress={() => handleViewDocument(file)}
                          >
                            <MaterialIcons
                              name={
                                file.type.startsWith("image/")
                                  ? "image"
                                  : "description"
                              }
                              size={20}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                ) : (
                  <Text style={styles.noDocumentsText}>
                    No Documents Uploaded
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Checklist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checklist</Text>
        {checklistTables.length === 0 ? (
          <Text style={styles.noDocumentsText}>No Checklist Data</Text>
        ) : (
          checklistTables.map(
            (table: EquipmentFrequencyChecklistTable, idx: number) => {
              const parent = table.equipmentFrequencyChecklists[0];
              const children = table.equipmentFrequencyChecklistChild;
              const isExpanded = expandedChecklistIndex === idx;
              return (
                <View key={parent.id} style={{ marginBottom: 16 }}>
                  {/* Collapsible Bar */}
                  <TouchableOpacity
                    style={styles.collapsableBar}
                    onPress={() =>
                      setExpandedChecklistIndex(isExpanded ? null : idx)
                    }
                  >
                    <Text style={styles.collapsableBarText}>
                      Date of Inspection:{" "}
                      {parent.dateofInspection
                        ? new Date(parent.dateofInspection).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={24}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <View style={styles.collapsableContent}>
                      {/* Checklist Table */}
                      {children.map(
                        (
                          child: EquipmentFrequencyChecklistChild,
                          cidx: number
                        ) => (
                          <View
                            key={child.id}
                            style={[
                              styles.checklistCard,
                              cidx !== children.length - 1 &&
                                styles.checklistCardBorder,
                            ]}
                          >
                            <View style={styles.cardRow}>
                              <Text style={styles.cardLabel}>
                                Checklist Item:
                              </Text>
                              <Text style={styles.cardValue}>
                                {child.checklistName}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardLabel}>Result:</Text>
                              <Text style={styles.cardValue}>
                                {child.result}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardLabel}>Remarks:</Text>
                              <Text style={styles.cardValue}>
                                {child.remarks}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardLabel}>Documents:</Text>
                              {child.proofDocument ? (
                                <View style={styles.inlineProofIcons}>
                                  {child.proofDocument
                                    .split(",")
                                    .map(
                                      (fileName: string, fileIndex: number) => {
                                        const file = {
                                          uri: `${baseURL}/uploads/Equipmentsfiles/${fileName.trim()}`,
                                          name: fileName.trim(),
                                          type: fileName
                                            .toLowerCase()
                                            .endsWith(".pdf")
                                            ? "application/pdf"
                                            : fileName
                                                .toLowerCase()
                                                .endsWith(".xlsx") ||
                                              fileName
                                                .toLowerCase()
                                                .endsWith(".xls")
                                            ? "application/vnd.ms-excel"
                                            : fileName
                                                .toLowerCase()
                                                .endsWith(".jpg") ||
                                              fileName
                                                .toLowerCase()
                                                .endsWith(".jpeg") ||
                                              fileName
                                                .toLowerCase()
                                                .endsWith(".png")
                                            ? "image/jpeg"
                                            : "application/octet-stream",
                                        };
                                        return (
                                          <TouchableOpacity
                                            key={fileIndex}
                                            style={styles.inlineProofIconItem}
                                            onPress={() =>
                                              handleViewDocument(file)
                                            }
                                          >
                                            <MaterialIcons
                                              name={
                                                file.type.startsWith("image/")
                                                  ? "image"
                                                  : file.type ===
                                                    "application/pdf"
                                                  ? "picture-as-pdf"
                                                  : "description"
                                              }
                                              size={22}
                                              color={COLORS.primary}
                                            />
                                          </TouchableOpacity>
                                        );
                                      }
                                    )}
                                </View>
                              ) : (
                                <Text style={styles.noDocumentsText}>
                                  No Documents Uploaded
                                </Text>
                              )}
                            </View>
                          </View>
                        )
                      )}

                      {/* Uploaded Documents for Parent */}
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Uploaded Documents</Text>
                        {parent.proofDocument ? (
                          <View style={styles.tpiProofGrid}>
                            {parent.proofDocument
                              .split(",")
                              .map((fileName: string, fileIndex: number) => {
                                const file = {
                                  uri: `${baseURL}/uploads/ChecklistFiles/${fileName.trim()}`,
                                  name: fileName.trim(),
                                  type: fileName.toLowerCase().endsWith(".pdf")
                                    ? "application/pdf"
                                    : fileName
                                        .toLowerCase()
                                        .endsWith(".xlsx") ||
                                      fileName.toLowerCase().endsWith(".xls")
                                    ? "application/vnd.ms-excel"
                                    : fileName.toLowerCase().endsWith(".jpg") ||
                                      fileName
                                        .toLowerCase()
                                        .endsWith(".jpeg") ||
                                      fileName.toLowerCase().endsWith(".png")
                                    ? "image/jpeg"
                                    : "application/octet-stream",
                                };
                                return (
                                  <FilePreview key={fileIndex} file={file} />
                                );
                              })}
                          </View>
                        ) : (
                          <Text style={styles.noDocumentsText}>
                            No Documents Uploaded
                          </Text>
                        )}
                      </View>

                      {/* Remarks */}
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Remarks</Text>
                        <TextInput
                          style={[styles.input, styles.disabledInput]}
                          value={parent.remarks || ""}
                          editable={false}
                        />
                      </View>

                      {/* Date of Inspection */}
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Date of Inspection</Text>
                        <TextInput
                          style={[styles.input, styles.disabledInput]}
                          value={
                            parent.dateofInspection
                              ? new Date(
                                  parent.dateofInspection
                                ).toLocaleDateString("en-GB")
                              : ""
                          }
                          editable={false}
                        />
                      </View>

                      {/* Inspection By */}
                      <View style={styles.formGroup}>
                        <View style={styles.checkboxContainer}>
                          <TouchableOpacity
                            style={[
                              styles.customCheckbox,
                              styles.disabledCheckbox,
                            ]}
                          >
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#fff"
                            />
                          </TouchableOpacity>
                          <Text style={styles.checkboxLabel}>
                            Test Certified By{" "}
                            {table.inspectedBYName || "Certified"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            }
          )
        )}
      </View>

      {/* Certify */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certify</Text>
        <Text style={[styles.sectionTitle, { fontSize: SIZES.small + 4 }]}>
          Inspection Checklist
        </Text>
        {equipmentCategoryChecklist.map((checklist, index) => (
          <View key={index} style={styles.checklistItem}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Checklist Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={checklist.checkList}
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Result</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={checklist.result || ""}
                  onValueChange={(value) => {
                    const updatedChecklist = [...equipmentCategoryChecklist];
                    updatedChecklist[index] = {
                      ...updatedChecklist[index],
                      result: value,
                    };
                    setEquipmentCategoryChecklist(updatedChecklist);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Result" value="" />
                  <Picker.Item label="Yes" value="Yes" />
                  <Picker.Item label="No" value="No" />
                  <Picker.Item label="N/A" value="N/A" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={styles.textArea}
                value={checklist.remarks || ""}
                onChangeText={(value) => {
                  const updatedChecklist = [...equipmentCategoryChecklist];
                  updatedChecklist[index] = {
                    ...updatedChecklist[index],
                    remarks: value,
                  };
                  setEquipmentCategoryChecklist(updatedChecklist);
                }}
                multiline
                numberOfLines={3}
                placeholder="Enter remarks"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Upload Files</Text>
              <View style={{ marginTop: 2 }}>
                <CustomButton
                  title="Upload"
                  onPress={() => {
                    const setFile = (file: FileData | null) => {
                      if (file) {
                        const updatedChecklist = [
                          ...equipmentCategoryChecklist,
                        ];
                        updatedChecklist[index] = {
                          ...updatedChecklist[index],
                          uploadedDocument: file.uri,
                        };
                        setEquipmentCategoryChecklist(updatedChecklist);
                      }
                    };
                    pickDocument(setFile);
                  }}
                  variant="primary"
                />
                {checklist.uploadedDocument && (
                  <FilePreview
                    file={{
                      uri: checklist.uploadedDocument,
                      name: checklist.uploadedDocument.split("/").pop() || "",
                      type: "application/octet-stream",
                    }}
                  />
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Attachments (Only image and PDF files are allowed.) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Attachments (Only image and PDF files are allowed.)
        </Text>
        <View style={{ marginTop: 2 }}>
          <CustomButton
            title="Upload"
            onPress={() => pickDocument(setAttachments)}
            variant="primary"
          />
          {attachments && <FilePreview file={attachments} />}
        </View>
      </View>

      {/* Additional Remarks */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Additional Remarks</Text>
        <TextInput
          style={styles.textArea}
          onChangeText={(value) => {
            setAdditionalRemarks(value);
          }}
          multiline
          numberOfLines={3}
          placeholder="Enter additional remarks"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Submit"
          onPress={() => {
            handleSubmit();
          }}
          variant="primary"
        />
      </View>

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
  );
};

export default ChecklistDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginVertical: 16,
  },
  infoText: {
    fontSize: SIZES.medium,
    marginBottom: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.gray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray,
  },
  tableHeaderText: {
    color: COLORS.background,
    fontWeight: "600",
    textAlign: "center",
    fontSize: SIZES.medium,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  tableCell: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray,
  },
  tableCellText: {
    fontSize: SIZES.medium - 2,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
    padding: 12,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50", // green to indicate "checked"
    alignItems: "center",
    justifyContent: "center",
  },

  disabledCheckbox: {
    opacity: 0.6,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },

  collapsableBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  collapsableBarText: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.white,
  },
  collapsableContent: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 6,
  },
  checklistCard: {
    backgroundColor: "#f5f8ff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  checklistCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#d0d7e3", // softer gray
    paddingBottom: 12,
    marginBottom: 12,
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
  proofGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  proofItem: {
    width: "30%",
    aspectRatio: 1,
  },
  tpiProofGrid: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tpiProofItem: {
    padding: 4,
  },
  noDocumentsText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
  inlineProofIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineProofIconItem: {
    marginRight: 8,
  },
  checklistItem: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
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
  required: {
    color: "red",
  },
});
