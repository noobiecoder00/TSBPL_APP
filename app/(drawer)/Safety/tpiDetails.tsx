import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Buffer } from "buffer";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
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

const TpiDetails = () => {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tpiExpiryDate, setTpiExpiryDate] = useState(new Date());
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();

  const [equipmentDetails, setEquipmentDetails] = useState({
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

  const [tpiInfoDetails, setTpiInfoDetails] = useState<TpiChecklist[]>([]);

  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
    onClose?: () => void;
  }>({
    visible: false,
    message: "",
    type: "info",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const onTpiExpiryDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTpiExpiryDate(selectedDate);
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

  useEffect(() => {
    const initialize = async () => {
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
  }, [id]); // Only depend on id changes

  useEffect(() => {
    if (userData?.id) {
      fetchTpiDetails();
    }
  }, [userData?.id]);

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
      const response = await httpClient.get(
        `${API_ENDPOINTS.SAFETY.TPI_DETAILS}?id=${encodedId}&UserId=${encodedUserId}&tpi=1`
      );
      const equipmentDetails = response.data.equipmentMaster;
      const tpiInfoDetails = response.data.equipmentTPIChecklists;
      setEquipmentDetails(equipmentDetails);
      setTpiInfoDetails(tpiInfoDetails);

      if (equipmentDetails.proofUploadDocuments) {
        const files = equipmentDetails.proofUploadDocuments
          .split(",")
          .map((fileName: string) => ({
            uri: `${baseURL}/uploads/equipmentfiles/${fileName}`,
            name: fileName,
            type: fileName.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg",
          }));
        setProofUploaded(files);
      }

      console.log(proofUploaded);

      //Set equipment details
      setEquipmentDetails({
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

  return (
    <ScrollView style={styles.container}>
      {/* General Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference No</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Reference No"
            value={equipmentDetails.referenceNo}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Equipment Category"
            value={equipmentDetails.equipmentCategory}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Equipment Name"
            value={equipmentDetails.equipmentName}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput
            style={styles.input}
            value={equipmentDetails.frequency}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Zone</Text>
          <TextInput
            style={styles.input}
            value={equipmentDetails.zone}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
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
            style={styles.input}
            value={equipmentDetails.alert}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof</Text>
          <TextInput
            style={styles.input}
            value={equipmentDetails.proof}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof Uploaded</Text>
          <View style={styles.proofGrid}>
            {proofUploaded.map((proof, index) => (
              <View key={index} style={styles.proofItem}>
                <FilePreview file={proof} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
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
                {tpi.proofDocuments && (
                  <TouchableOpacity
                    onPress={() => {
                      const files = tpi.proofDocuments
                        .split(",")
                        .map((fileName: string) => ({
                          uri: `${baseURL}/uploads/EquipmentFiles/${fileName}`,
                          name: fileName,
                          type: fileName.toLowerCase().endsWith(".pdf")
                            ? "application/pdf"
                            : "image/jpeg",
                        }));
                      if (files.length > 0) {
                        handleViewDocument(files[0]);
                      }
                    }}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Checklist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checklist</Text>

        <TouchableOpacity
          style={styles.collapsableBar}
          onPress={() => setIsChecklistExpanded(!isChecklistExpanded)}
        >
          <Text style={styles.collapsableBarText}>
            Date of Inspection 10-05-2025
          </Text>
          <Ionicons
            name={isChecklistExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={COLORS.gray}
          />
        </TouchableOpacity>

        {isChecklistExpanded && (
          <View style={styles.collapsableContent}>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemText}>1. Checklist Item</Text>
              <Text style={styles.checklistStatus}>Check 1</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemText}>2. Result</Text>
              <Text style={styles.checklistStatus}>Fail</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistItemText}>3. Remarks</Text>
              <Text style={styles.checklistStatus}>Good</Text>
            </View>
            <View style={[styles.checklistItem]}>
              <Text style={styles.checklistItemText}>4. Documents</Text>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Uploaded Documents</Text>
              <View style={{ marginTop: 2 }}>
                <CustomButton
                  title="View"
                  onPress={() => {}}
                  variant="primary"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput style={styles.input} value="Good" editable={false} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Inspection</Text>
              <TextInput
                style={styles.input}
                value="10-05-2025"
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsChecked(!isChecked)}
              >
                <View
                  style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                >
                  {isChecked && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={COLORS.background}
                    />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Test Certified by PMD</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* TPI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TPI</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select TPI Expiry Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(tpiExpiryDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={tpiExpiryDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTpiExpiryDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload Files</Text>
          <View style={{ marginTop: 2 }}>
            <CustomButton title="Upload" onPress={() => {}} variant="primary" />
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton title="Submit" onPress={() => {}} variant="primary" />
      </View>
    </ScrollView>
  );
};

export default TpiDetails;

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
    fontSize: SIZES.medium,
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
  collapsableBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  collapsableBarText: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.text,
  },
  collapsableContent: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  checklistItemText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  checklistStatus: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 5,
  },
  viewButtonText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.medium,
    color: COLORS.text,
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
});
