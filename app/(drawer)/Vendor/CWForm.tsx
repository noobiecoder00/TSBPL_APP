import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { baseURL } from "@/utils/httpClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface CWFormProps {
  id: number;
  cwFlowId: number;
  initialData: any;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  vendors: { id: number; name: string }[];
}

export default function CWForm({
  id,
  cwFlowId,
  initialData,
  onSubmit,
  isSubmitting,
  vendors,
}: CWFormProps) {
  const [formData, setFormData] = useState({
    id: id,
    cwFlowId: cwFlowId,
    name: initialData?.cwName || "",
    address: initialData?.address || "",
    mobileNumber: initialData?.mobileNumber || "",
    spouseContactNumber: initialData?.relativeContactNo || "",
    aadhaarNumber: initialData?.aadhaarNo?.toString() || "",
    education: initialData?.education || "",
    department: initialData?.department || "",
    jobDesignation: initialData?.jobDescription || "",
    skillType: initialData?.skillType || "",
    experience: initialData?.experience || "",
    bankName: initialData?.bankName || "",
    bankAccountNumber: initialData?.bankAccountNo || "",
    epfNumber: initialData?.epxNo || "",
    esicNumber: initialData?.esicNo || "",
    uanNumber: initialData?.uanNo || "",
    remarks: initialData?.remarks || "",
  });

  const [dob, setDob] = useState(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date()
  );
  const [doj, setDoj] = useState(
    initialData?.dateOfJoining
      ? new Date(initialData.dateOfJoining)
      : new Date()
  );
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState(
    initialData?.gender || null
  );
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(
    initialData?.bloodGroup || null
  );
  const [selectedVendor, setSelectedVendor] = useState(
    initialData?.vendorId || null
  );
  const [selectedPhoto, setSelectedPhoto] = useState<FileData | null>(
    initialData?.profilePhoto
      ? {
          uri: `${baseURL}/uploads/cwfiles/${initialData.profilePhoto}`,
          name: initialData.profilePhoto,
          type: "image/jpeg",
        }
      : null
  );
  const [selectedIdProof, setSelectedIdProof] = useState<FileData | null>(
    initialData?.idProofDetail
      ? {
          uri: `${baseURL}/uploads/cwfiles/${initialData.idProofDetail}`,
          name: initialData.idProofDetail,
          type: "application/pdf",
        }
      : null
  );
  const [selectedMedicalExamination, setSelectedMedicalExamination] =
    useState<FileData | null>(
      initialData?.medicalExaminationCertification
        ? {
            uri: `${baseURL}/uploads/cwfiles/${initialData.medicalExaminationCertification}`,
            name: initialData.medicalExaminationCertification,
            type: "application/pdf",
          }
        : null
    );
  const [selectedPoliceVerification, setSelectedPoliceVerification] =
    useState<FileData | null>(
      initialData?.policyVerificationReport
        ? {
            uri: `${baseURL}/uploads/cwfiles/${initialData.policyVerificationReport}`,
            name: initialData.policyVerificationReport,
            type: "image/jpeg",
          }
        : null
    );
  const [selectedSafetyInduction, setSelectedSafetyInduction] =
    useState<FileData | null>(
      initialData?.safetyInduction
        ? {
            uri: `${baseURL}/uploads/cwfiles/${initialData.safetyInduction}`,
            name: initialData.safetyInduction,
            type: "application/pdf",
          }
        : null
    );
  const [selectedWahCertified, setSelectedWahCertified] =
    useState<FileData | null>(
      initialData?.wahCertified
        ? {
            uri: `${baseURL}/uploads/cwfiles/${initialData.wahCertified}`,
            name: initialData.wahCertified,
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }
        : null
    );
  const [selectedFirstAidTraining, setSelectedFirstAidTraining] =
    useState<FileData | null>(
      initialData?.firstAidTraining
        ? {
            uri: `${baseURL}/uploads/cwfiles/${initialData.firstAidTraining}`,
            name: initialData.firstAidTraining,
            type: "image/jpeg",
          }
        : null
    );

  const genderItems = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
    { label: "Transgender", value: "T" },
  ];

  const bloodGroupItems = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedPhoto({
        uri: asset.uri,
        name: asset.uri.split("/").pop() || "photo.jpg",
        type: "image/jpeg",
      });
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
      console.error("Error picking document:", error);
    }
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      dob,
      doj,
      gender: selectedGender,
      bloodGroup: selectedBloodGroup,
      vendorId: selectedVendor,
      photo: selectedPhoto,
      idProof: selectedIdProof,
      medicalExamination: selectedMedicalExamination,
      policeVerification: selectedPoliceVerification,
      safetyInduction: selectedSafetyInduction,
      wahCertified: selectedWahCertified,
      firstAidTraining: selectedFirstAidTraining,
      remarks: formData.remarks,
      Id: formData.id,
      CWFlowId: cwFlowId,
      flowId: cwFlowId,
    };
    console.log("Form submission data:", submitData);
    onSubmit(submitData);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Personal Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Contract Worker Name" />
          <TextInput
            style={styles.input}
            placeholder="Enter Contract Worker Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Date of Birth" />
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDobPicker(true)}
          >
            <Text>{formatDate(dob)}</Text>
          </TouchableOpacity>
          {showDobPicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDobPicker(false);
                if (selectedDate) {
                  setDob(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Date of Joining" />
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDojPicker(true)}
          >
            <Text>{formatDate(doj)}</Text>
          </TouchableOpacity>
          {showDojPicker && (
            <DateTimePicker
              value={doj}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDojPicker(false);
                if (selectedDate) {
                  setDoj(selectedDate);
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Gender" />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedGender}
              onValueChange={(value) => setSelectedGender(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value={null} />
              {genderItems.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Blood Group" />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBloodGroup}
              onValueChange={(value) => setSelectedBloodGroup(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Blood Group" value={null} />
              {bloodGroupItems.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Address" />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter Address"
            multiline
            numberOfLines={3}
            value={formData.address}
            onChangeText={(text) => handleInputChange("address", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Mobile Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
            value={formData.mobileNumber}
            onChangeText={(text) => handleInputChange("mobileNumber", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Spouse / Parent Contact Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter Contact Number"
            keyboardType="numeric"
            value={formData.spouseContactNumber}
            onChangeText={(text) =>
              handleInputChange("spouseContactNumber", text)
            }
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Aadhaar Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter Aadhaar Number"
            keyboardType="numeric"
            value={formData.aadhaarNumber}
            onChangeText={(text) => handleInputChange("aadhaarNumber", text)}
          />
        </View>
      </View>

      {/* Job & Education Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job & Education Details</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Education" />
          <TextInput
            style={styles.input}
            placeholder="Enter Education"
            value={formData.education}
            onChangeText={(text) => handleInputChange("education", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Vendor Code" />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedVendor}
              onValueChange={(value) => setSelectedVendor(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Vendor" value={null} />
              {vendors.map((vendor) => (
                <Picker.Item
                  key={vendor.id}
                  label={vendor.name}
                  value={vendor.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Department" />
          <TextInput
            style={styles.input}
            placeholder="Enter Department"
            value={formData.department}
            onChangeText={(text) => handleInputChange("department", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Job Designation" />
          <TextInput
            style={styles.input}
            placeholder="Enter Designation"
            value={formData.jobDesignation}
            onChangeText={(text) => handleInputChange("jobDesignation", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Skill Type" />
          <TextInput
            style={styles.input}
            placeholder="Enter Skill Type"
            value={formData.skillType}
            onChangeText={(text) => handleInputChange("skillType", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Experience" />
          <TextInput
            style={styles.input}
            placeholder="Enter Experience"
            value={formData.experience}
            onChangeText={(text) => handleInputChange("experience", text)}
          />
        </View>
      </View>

      {/* Banking Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banking Details</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Bank Name" />
          <TextInput
            style={styles.input}
            placeholder="Enter Bank Name"
            value={formData.bankName}
            onChangeText={(text) => handleInputChange("bankName", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Bank Account Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter Bank Account Number"
            keyboardType="numeric"
            value={formData.bankAccountNumber}
            onChangeText={(text) =>
              handleInputChange("bankAccountNumber", text)
            }
          />
        </View>
      </View>

      {/* EPF & ESIC Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EPF & ESIC Details</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="EPF Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter EPF Number"
            value={formData.epfNumber}
            onChangeText={(text) => handleInputChange("epfNumber", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="ESIC Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter ESIC Number"
            value={formData.esicNumber}
            onChangeText={(text) => handleInputChange("esicNumber", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="UAN Number" />
          <TextInput
            style={styles.input}
            placeholder="Enter UAN Number"
            value={formData.uanNumber}
            onChangeText={(text) => handleInputChange("uanNumber", text)}
          />
        </View>
      </View>

      {/* Document Uploads Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Uploads</Text>

        <View style={styles.formGroup}>
          <RequiredLabel label="CW Profile Photo" />
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>Choose Photo</Text>
          </TouchableOpacity>
          {selectedPhoto ? (
            <FilePreview file={selectedPhoto} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="ID Proof Detail" />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedIdProof)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedIdProof ? (
            <FilePreview file={selectedIdProof} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Medical Examination" />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedMedicalExamination)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedMedicalExamination ? (
            <FilePreview file={selectedMedicalExamination} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Police Verification Report" />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedPoliceVerification)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedPoliceVerification ? (
            <FilePreview file={selectedPoliceVerification} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>
      </View>

      {/* Certifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Safety Induction" />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedSafetyInduction)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedSafetyInduction ? (
            <FilePreview file={selectedSafetyInduction} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>WAH Certified *</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedWahCertified)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedWahCertified ? (
            <FilePreview file={selectedWahCertified} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="First-Aid Training" />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(setSelectedFirstAidTraining)}
          >
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {selectedFirstAidTraining ? (
            <FilePreview file={selectedFirstAidTraining} />
          ) : (
            <Text style={styles.noFileText}>No file selected</Text>
          )}
        </View>
      </View>

      {/* Remarks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remarks</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Remarks" />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter Remarks"
            multiline
            numberOfLines={3}
            value={formData.remarks}
            onChangeText={(text) => handleInputChange("remarks", text)}
          />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Submit"
          onPress={handleSubmit}
          variant="primary"
          disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  section: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    elevation: 2,
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  formGroup: {
    marginBottom: SIZES.medium,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.small,
    padding: SIZES.small,
    fontSize: SIZES.medium,
    backgroundColor: COLORS.background,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.small,
    backgroundColor: COLORS.background,
  },
  picker: {
    height: 50,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLORS.background,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  uploadButtonText: {
    color: COLORS.background,
    ...FONTS.medium,
  },
  buttonContainer: {
    marginTop: SIZES.large,
    marginBottom: SIZES.xlarge,
  },
  noFileText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: "italic",
    marginTop: SIZES.small,
  },
  required: {
    color: "red",
  },
});
