import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import {
  Alert,
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

interface Vendor {
  id: number;
  name: string;
}

interface CWCreateFormResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface FormDataFile {
  uri: string;
  name: string;
  type: string;
}

export default function CWCreateForm() {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mobileNumber: "",
    spouseContactNumber: "",
    aadhaarNumber: "",
    education: "",
    department: "",
    jobDesignation: "",
    skillType: "",
    experience: "",
    bankName: "",
    bankAccountNumber: "",
    epfNumber: "",
    esicNumber: "",
    uanNumber: "",
  });
  const [dob, setDob] = useState<Date | null>(null);
  const [doj, setDoj] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(
    null
  );
  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );
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

  const [selectedPhoto, setSelectedPhoto] = useState<FileData | null>(null);
  const [selectedIdProof, setSelectedIdProof] = useState<FileData | null>(null);
  const [selectedMedicalExamination, setSelectedMedicalExamination] =
    useState<FileData | null>(null);
  const [selectedPoliceVerification, setSelectedPoliceVerification] =
    useState<FileData | null>(null);
  const [selectedSafetyInduction, setSelectedSafetyInduction] =
    useState<FileData | null>(null);
  const [selectedWahCertified, setSelectedWahCertified] =
    useState<FileData | null>(null);
  const [selectedFirstAidTraining, setSelectedFirstAidTraining] =
    useState<FileData | null>(null);

  // useEffect(() => {
  //   fetchVendors();
  //   loadUserData();
  //   resetStates();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVendors();
      loadUserData();
      resetStates();
    }, [])
  );

  const resetStates = () => {
    setDob(null);
    setDoj(null);
    setSelectedGender(null);
    setSelectedBloodGroup(null);
    setSelectedVendor(null);
    setSelectedPhoto(null);
    setSelectedIdProof(null);
    setSelectedMedicalExamination(null);
    setSelectedPoliceVerification(null);
    setSelectedSafetyInduction(null);
    setSelectedWahCertified(null);
    setSelectedFirstAidTraining(null);
  };

  const fetchVendors = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(API_ENDPOINTS.VENDOR.LIST);
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to load vendors. Please try again.");
    } finally {
      dispatch(hideLoading());
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

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateToSend = (date: Date | null) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const onDobChange = (event: any, selectedDate?: Date) => {
    setShowDobPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const onDojChange = (event: any, selectedDate?: Date) => {
    setShowDojPicker(false);
    if (selectedDate) {
      setDoj(selectedDate);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "name", label: "Contract Worker Name" },
      { field: "address", label: "Address" },
      { field: "mobileNumber", label: "Mobile Number" },
      { field: "spouseContactNumber", label: "Spouse/Parent Contact Number" },
      { field: "aadhaarNumber", label: "Aadhaar Number" },
      { field: "education", label: "Education" },
      { field: "department", label: "Department" },
      { field: "jobDesignation", label: "Job Designation" },
      { field: "skillType", label: "Skill Type" },
      { field: "experience", label: "Experience" },
      { field: "bankName", label: "Bank Name" },
      { field: "bankAccountNumber", label: "Bank Account Number" },
      { field: "epfNumber", label: "EPF Number" },
      { field: "esicNumber", label: "ESIC Number" },
      { field: "uanNumber", label: "UAN Number" },
    ];

    // Validate text fields
    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert("Validation Error", `${label} is required`);
        return false;
      }
    }

    // Validate selection fields
    if (!selectedGender) {
      Alert.alert("Validation Error", "Gender is required");
      return false;
    }

    if (!selectedBloodGroup) {
      Alert.alert("Validation Error", "Blood Group is required");
      return false;
    }

    if (!selectedVendor) {
      Alert.alert("Validation Error", "Vendor is required");
      return false;
    }

    // Validate file uploads
    if (!selectedPhoto) {
      Alert.alert("Validation Error", "Profile Photo is required");
      return false;
    }

    if (!selectedIdProof) {
      Alert.alert("Validation Error", "ID Proof is required");
      return false;
    }

    if (!selectedMedicalExamination) {
      Alert.alert(
        "Validation Error",
        "Medical Examination document is required"
      );
      return false;
    }

    if (!selectedPoliceVerification) {
      Alert.alert("Validation Error", "Police Verification Report is required");
      return false;
    }

    if (!selectedSafetyInduction) {
      Alert.alert("Validation Error", "Safety Induction document is required");
      return false;
    }

    if (!selectedWahCertified) {
      Alert.alert("Validation Error", "WAH Certification document is required");
      return false;
    }

    if (!selectedFirstAidTraining) {
      Alert.alert(
        "Validation Error",
        "First-Aid Training document is required"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(showLoading());
      setError(null);

      const formDataToSend = {
        CWName: formData.name,
        DateOfBirth: formatDateToSend(dob),
        DateOfJoining: formatDateToSend(doj),
        Gender: selectedGender,
        BloodGroup: selectedBloodGroup,
        Address: formData.address,
        MobileNumber: formData.mobileNumber,
        RelativeContactNo: formData.spouseContactNumber,
        AadhaarNo: formData.aadhaarNumber,
        Education: formData.education,
        VendorId: selectedVendor,
        Department: formData.department,
        JobDescription: formData.jobDesignation,
        SkillType: formData.skillType,
        Experience: formData.experience,
        BankName: formData.bankName,
        BankAccountNo: formData.bankAccountNumber,
        EPXNo: formData.epfNumber,
        ESICNo: formData.esicNumber,
        UANNo: formData.uanNumber,
        CreatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
      };

      // Create FormData for multipart/form-data
      const multipartFormData = new FormData();

      // Add all text fields
      Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          multipartFormData.append(key, value.toString());
        }
      });

      // Add files
      if (selectedPhoto) {
        const photoFile: FormDataFile = {
          uri: selectedPhoto.uri,
          name: selectedPhoto.name,
          type: selectedPhoto.type,
        };
        multipartFormData.append("ProfilePhoto", photoFile as any);
      }

      if (selectedIdProof) {
        const idProofFile: FormDataFile = {
          uri: selectedIdProof.uri,
          name: selectedIdProof.name,
          type: selectedIdProof.type,
        };
        multipartFormData.append("IdProofDetail", idProofFile as any);
      }

      if (selectedMedicalExamination) {
        const medicalFile: FormDataFile = {
          uri: selectedMedicalExamination.uri,
          name: selectedMedicalExamination.name,
          type: selectedMedicalExamination.type,
        };
        multipartFormData.append(
          "MedicalExaminationCertification",
          medicalFile as any
        );
      }

      if (selectedPoliceVerification) {
        const policeFile: FormDataFile = {
          uri: selectedPoliceVerification.uri,
          name: selectedPoliceVerification.name,
          type: selectedPoliceVerification.type,
        };
        multipartFormData.append("PolicyVerificationReport", policeFile as any);
      }

      if (selectedSafetyInduction) {
        const safetyFile: FormDataFile = {
          uri: selectedSafetyInduction.uri,
          name: selectedSafetyInduction.name,
          type: selectedSafetyInduction.type,
        };
        multipartFormData.append("SafetyInduction", safetyFile as any);
      }

      if (selectedWahCertified) {
        const wahFile: FormDataFile = {
          uri: selectedWahCertified.uri,
          name: selectedWahCertified.name,
          type: selectedWahCertified.type,
        };
        multipartFormData.append("WAHCertified", wahFile as any);
      }

      if (selectedFirstAidTraining) {
        const firstAidFile: FormDataFile = {
          uri: selectedFirstAidTraining.uri,
          name: selectedFirstAidTraining.name,
          type: selectedFirstAidTraining.type,
        };
        multipartFormData.append("FirstAidTraining", firstAidFile as any);
      }

      // console.log("Plain JSON data:", formDataToSend);

      const response = await httpClient.post<CWCreateFormResponse>(
        API_ENDPOINTS.CW.CREATE,
        multipartFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 seconds
        }
      );

      if (response.data.success) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: response.data.success ? "success" : "error",
          redirect: true,
          redirectPath: "/(drawer)/Vendor",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
        resetForm();
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to create contract worker",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Error creating contract worker:", error);
      setAlert({
        visible: true,
        message:
          error.response?.data?.message || "Failed to create contract worker",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      dispatch(hideLoading());
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      mobileNumber: "",
      spouseContactNumber: "",
      aadhaarNumber: "",
      education: "",
      department: "",
      jobDesignation: "",
      skillType: "",
      experience: "",
      bankName: "",
      bankAccountNumber: "",
      epfNumber: "",
      esicNumber: "",
      uanNumber: "",
    });
    setDob(null);
    setDoj(null);
    setSelectedGender(null);
    setSelectedBloodGroup(null);
    setSelectedVendor(null);
    setSelectedPhoto(null);
    setSelectedIdProof(null);
    setSelectedMedicalExamination(null);
    setSelectedPoliceVerification(null);
    setSelectedSafetyInduction(null);
    setSelectedWahCertified(null);
    setSelectedFirstAidTraining(null);
  };

  return (
    <View style={styles.mainContainer}>
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
              onChangeText={(value) => handleInputChange("name", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Date of Birth" />
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDobPicker(true)}
            >
              <Text>{dob ? formatDate(dob) : "Select Date"}</Text>
            </TouchableOpacity>
            {showDobPicker && (
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDobChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Date of Joining" />
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDojPicker(true)}
            >
              <Text>{doj ? formatDate(doj) : "Select Date"}</Text>
            </TouchableOpacity>
            {showDojPicker && (
              <DateTimePicker
                value={doj || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDojChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Gender" />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGender}
                onValueChange={(itemValue) => setSelectedGender(itemValue)}
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
                onValueChange={(itemValue) => setSelectedBloodGroup(itemValue)}
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
              onChangeText={(value) => handleInputChange("address", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Mobile Number" />
            <TextInput
              style={styles.input}
              placeholder="Enter Mobile Number"
              keyboardType="numeric"
              value={formData.mobileNumber}
              onChangeText={(value) => handleInputChange("mobileNumber", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Spouse / Parent Contact Number" />
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              keyboardType="numeric"
              value={formData.spouseContactNumber}
              onChangeText={(value) =>
                handleInputChange("spouseContactNumber", value)
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
              onChangeText={(value) =>
                handleInputChange("aadhaarNumber", value)
              }
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
              onChangeText={(value) => handleInputChange("education", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Vendor Code" />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedVendor}
                onValueChange={(itemValue) => setSelectedVendor(itemValue)}
                style={styles.picker}
                enabled={!isLoading}
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
              onChangeText={(value) => handleInputChange("department", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Job Designation" />
            <TextInput
              style={styles.input}
              placeholder="Enter Designation"
              value={formData.jobDesignation}
              onChangeText={(value) =>
                handleInputChange("jobDesignation", value)
              }
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Skill Type" />
            <TextInput
              style={styles.input}
              placeholder="Enter Skill Type"
              value={formData.skillType}
              onChangeText={(value) => handleInputChange("skillType", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Experience" />
            <TextInput
              style={styles.input}
              placeholder="Enter Experience"
              value={formData.experience}
              onChangeText={(value) => handleInputChange("experience", value)}
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
              onChangeText={(value) => handleInputChange("bankName", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Bank Account Number" />
            <TextInput
              style={styles.input}
              placeholder="Enter Bank Account Number"
              keyboardType="numeric"
              value={formData.bankAccountNumber}
              onChangeText={(value) =>
                handleInputChange("bankAccountNumber", value)
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
              onChangeText={(value) => handleInputChange("epfNumber", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="ESIC Number" />
            <TextInput
              style={styles.input}
              placeholder="Enter ESIC Number"
              value={formData.esicNumber}
              onChangeText={(value) => handleInputChange("esicNumber", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="UAN Number" />
            <TextInput
              style={styles.input}
              placeholder="Enter UAN Number"
              value={formData.uanNumber}
              onChangeText={(value) => handleInputChange("uanNumber", value)}
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
            <Text style={styles.label}>WAH Certified</Text>
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

        {/* Submit Buttons */}
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
        <CustomAlert
          visible={alert.visible}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
          redirect={alert.redirect}
          redirectPath={alert.redirectPath}
        />
      </ScrollView>
      <Loader />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    marginBottom: SIZES.xlarge,
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
  },
  uploadButtonText: {
    color: COLORS.background,
    ...FONTS.medium,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.large,
    marginBottom: SIZES.xlarge,
    gap: SIZES.medium,
  },
  buttonWrapper: {
    flex: 1,
  },
  noFileText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: "italic",
    textAlign: "center",
  },
  required: {
    color: "red",
  },
});
