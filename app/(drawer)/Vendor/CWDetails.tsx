import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import FilePreview from "@/components/FilePreview";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient, { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { useDispatch } from "react-redux";
import CWForm from "./CWForm";

interface UserData {
  id: string;
}

interface Vendor {
  id: number;
  name: string;
}

interface CWSubmitResponse {
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

export default function CWDetails() {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cWDetails, setCWDetails] = useState<any>(null);
  const [cwMasterFlow, setCwMasterFlow] = useState<any[]>([]);
  const [cwFlowId, setCwFlowId] = useState<number | null>(null);
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

  const [isSee, setIsSee] = useState(false);
  const [actionFormData, setActionFormData] = useState({
    actionTaken: "",
    remarks: "",
    observedBy: "",
    escalationDate: "",
  });

  const [level, setLevel] = useState<number | null>(null);
  const [pendingUserName, setPendingUserName] = useState<string | null>(null);
  const [pendingUserRoleName, setPendingUserRoleName] = useState<string | null>(
    null
  );
  const [autoSlgTargetDate, setAutoSlgTargetDate] = useState<string | null>(
    null
  );
  const [tabUserName, setTabUserName] = useState<string | null>(null);
  const [tabUserRoleName, setTabUserRoleName] = useState<string | null>(null);
  const [dob, setDob] = useState(new Date());
  const [doj, setDoj] = useState(new Date());
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showDojPicker, setShowDojPicker] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(
    null
  );
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
  const [selectedDocument, setSelectedDocument] = useState<FileData | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        dispatch(showLoading());
        resetStates();
        await fetchVendors();
        await loadUserData();
        if (userData?.id) {
          await fetchCWDetails();
        }
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        dispatch(hideLoading());
      }
    };

    initialize();
  }, [id]); // Only depend on id changes

  // Separate useEffect for fetchCWDetails when userData changes
  useEffect(() => {
    if (userData?.id) {
      fetchCWDetails();
    }
  }, [userData?.id]);

  const resetStates = () => {
    setCWDetails(null);
    setCwMasterFlow([]);
    setCwFlowId(null);
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
    setIsSee(false);
    setActionFormData({
      actionTaken: "",
      remarks: "",
      observedBy: "",
      escalationDate: "",
    });
    setLevel(null);
    setPendingUserName(null);
    setPendingUserRoleName(null);
    setAutoSlgTargetDate(null);
    setTabUserName(null);
    setTabUserRoleName(null);
    setDob(new Date());
    setDoj(new Date());
    setSelectedVendor(null);
    setError(null);
    setSelectedGender(null);
    setSelectedBloodGroup(null);
    setSelectedPhoto(null);
    setSelectedIdProof(null);
    setSelectedMedicalExamination(null);
    setSelectedPoliceVerification(null);
    setSelectedSafetyInduction(null);
    setSelectedWahCertified(null);
    setSelectedFirstAidTraining(null);
    setSelectedDocument(null);
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

  const fetchCWDetails = async () => {
    if (!userData?.id) {
      console.log("Waiting for user data to be loaded...");
      return;
    }

    if (!id) {
      console.log("No CW ID provided");
      return;
    }

    dispatch(showLoading());
    try {
      const encodedId = id;
      const encodedUserId = Buffer.from(
        userData.id.toString(),
        "utf-8"
      ).toString("base64");
      console.log(
        `${API_ENDPOINTS.CW.DETAILS}?id=${encodedId}&UserId=${encodedUserId}`
      );
      const response = await httpClient.get(
        `${API_ENDPOINTS.CW.DETAILS}?id=${encodedId}&UserId=${encodedUserId}`
      );

      if (response.data?.success) {
        const cwData = response.data.data.cwMaster;
        if (!cwData) {
          console.warn("No CW data received from API");
          return;
        }
        setCWDetails(response.data.data);
        setCwMasterFlow(response.data.data.cwMasterFlow || []);
        setCwFlowId(response.data.data.cwMasterFlowLatest?.id);
        console.log("CW Flow ID:", response.data.data.cwMasterFlowLatest?.id);

        if (response.data.data.isSee === true) {
          setIsSee(true);
          setLevel(response.data.data.cwMasterFlowLatest?.level);
          setTabUserName(response.data.data.tabUserName);
          setTabUserRoleName(response.data.data.tabUserRoleName);

          // Format and set the autoSlgTargetDate
          if (response.data.data.autoSlgTargetDate) {
            const date = new Date(response.data.data.autoSlgTargetDate);
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
            observedBy: response.data.data.tabUserName || "",
            escalationDate: response.data.data.autoSlgTargetDate
              ? new Date(
                  response.data.data.autoSlgTargetDate
                ).toLocaleDateString("en-GB")
              : "",
          }));
        }

        // Set form data
        setFormData({
          name: cwData.cwName || "",
          address: cwData.address || "",
          mobileNumber: cwData.mobileNumber || "",
          spouseContactNumber: cwData.relativeContactNo || "",
          aadhaarNumber: cwData.aadhaarNo?.toString() || "",
          education: cwData.education || "",
          department: cwData.department || "",
          jobDesignation: cwData.jobDescription || "",
          skillType: cwData.skillType || "",
          experience: cwData.experience || "",
          bankName: cwData.bankName || "",
          bankAccountNumber: cwData.bankAccountNo || "",
          epfNumber: cwData.epxNo || "",
          esicNumber: cwData.esicNo || "",
          uanNumber: cwData.uanNo || "",
        });

        // Set dates
        if (cwData.dateOfBirth) {
          setDob(new Date(cwData.dateOfBirth));
        }

        // Set gender and blood group
        setSelectedGender(cwData.gender);
        setSelectedBloodGroup(cwData.bloodGroup);

        // Set vendor
        setSelectedVendor(cwData.vendorId);

        // Set file previews
        if (cwData.profilePhoto) {
          setSelectedPhoto({
            uri: `${baseURL}/uploads/cwfiles/${cwData.profilePhoto}`,
            name: cwData.profilePhoto,
            type: "image/jpeg",
          });
        }

        if (cwData.idProofDetail) {
          setSelectedIdProof({
            uri: `${baseURL}/uploads/cwfiles/${cwData.idProofDetail}`,
            name: cwData.idProofDetail,
            type: "application/pdf",
          });
        }

        if (cwData.medicalExaminationCertification) {
          setSelectedMedicalExamination({
            uri: `${baseURL}/uploads/cwfiles/${cwData.medicalExaminationCertification}`,
            name: cwData.medicalExaminationCertification,
            type: "application/pdf",
          });
        }

        if (cwData.policyVerificationReport) {
          setSelectedPoliceVerification({
            uri: `${baseURL}/uploads/cwfiles/${cwData.policyVerificationReport}`,
            name: cwData.policyVerificationReport,
            type: "image/jpeg",
          });
        }

        if (cwData.safetyInduction) {
          setSelectedSafetyInduction({
            uri: `${baseURL}/uploads/cwfiles/${cwData.safetyInduction}`,
            name: cwData.safetyInduction,
            type: "application/pdf",
          });
        }

        if (cwData.wahCertified) {
          setSelectedWahCertified({
            uri: `${baseURL}/uploads/cwfiles/${cwData.wahCertified}`,
            name: cwData.wahCertified,
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
        }

        if (cwData.firstAidTraining) {
          setSelectedFirstAidTraining({
            uri: `${baseURL}/uploads/cwfiles/${cwData.firstAidTraining}`,
            name: cwData.firstAidTraining,
            type: "image/jpeg",
          });
        }
      } else {
        console.warn(
          "CW details not found or API returned unsuccessful response"
        );
      }
    } catch (error) {
      console.error("Error fetching CW details:", error);
      setAlert({
        visible: true,
        message: "Failed to fetch CW details. Please try again.",
        type: "error",
        onClose: () => {
          setAlert((prev) => ({ ...prev, visible: false }));
        },
      });
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

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  const formatDateToSend = (date: Date) => {
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
      formDataToSend.append(
        "Id",
        cWDetails?.cwMasterFlowLatest?.id?.toString() || ""
      );
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

      console.log("Submitting form data:", {
        Id: cWDetails?.cwMasterFlowLatest?.id,
        Status_to: actionFormData.actionTaken,
        ActionTaken: actionFormData.remarks,
        AutoSLgTargetDate: autoSlgTargetDate,
        UpdatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : null,
        Document: selectedDocument ? "File attached" : "No file",
      });

      const response = await httpClient.post<CWSubmitResponse>(
        API_ENDPOINTS.CW.FLOW_ACTION,
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
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
            router.replace("/(drawer)/Vendor");
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

  const handleUpdate = async (formData: any) => {
    try {
      setIsSubmitting(true);
      dispatch(showLoading());
      setError(null);

      const formDataToSend = {
        CWName: formData.name,
        DateOfBirth: formatDateToSend(formData.dob),
        DateOfJoining: formatDateToSend(formData.doj),
        Gender: formData.gender,
        BloodGroup: formData.bloodGroup,
        Address: formData.address,
        MobileNumber: formData.mobileNumber,
        RelativeContactNo: formData.spouseContactNumber,
        AadhaarNo: formData.aadhaarNumber,
        Education: formData.education,
        VendorId: formData.vendorId,
        Department: formData.department,
        JobDescription: formData.jobDesignation,
        SkillType: formData.skillType,
        Experience: formData.experience,
        BankName: formData.bankName,
        BankAccountNo: formData.bankAccountNumber,
        EPXNo: formData.epfNumber,
        ESICNo: formData.esicNumber,
        UANNo: formData.uanNumber,
        CWFlowId: formData.CWFlowId || formData.flowId || cwFlowId,
        CWFlowRemarks: formData.remarks,
        id: formData.id,
        UpdatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
      };

      console.log("Sending update data:", formDataToSend);

      // Create FormData for multipart/form-data
      const multipartFormData = new FormData();

      // Add all text fields
      Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          multipartFormData.append(key, value.toString());
        }
      });

      // Add files
      if (formData.photo) {
        const photoFile = {
          uri: formData.photo.uri,
          name: formData.photo.name,
          type: formData.photo.type,
        };
        multipartFormData.append("ProfilePhoto", photoFile as any);
      }

      if (formData.idProof) {
        const idProofFile = {
          uri: formData.idProof.uri,
          name: formData.idProof.name,
          type: formData.idProof.type,
        };
        multipartFormData.append("IdProofDetail", idProofFile as any);
      }

      if (formData.medicalExamination) {
        const medicalFile = {
          uri: formData.medicalExamination.uri,
          name: formData.medicalExamination.name,
          type: formData.medicalExamination.type,
        };
        multipartFormData.append(
          "MedicalExaminationCertification",
          medicalFile as any
        );
      }

      if (formData.policeVerification) {
        const policeFile = {
          uri: formData.policeVerification.uri,
          name: formData.policeVerification.name,
          type: formData.policeVerification.type,
        };
        multipartFormData.append("PolicyVerificationReport", policeFile as any);
      }

      if (formData.safetyInduction) {
        const safetyFile = {
          uri: formData.safetyInduction.uri,
          name: formData.safetyInduction.name,
          type: formData.safetyInduction.type,
        };
        multipartFormData.append("SafetyInduction", safetyFile as any);
      }

      if (formData.wahCertified) {
        const wahFile = {
          uri: formData.wahCertified.uri,
          name: formData.wahCertified.name,
          type: formData.wahCertified.type,
        };
        multipartFormData.append("WAHCertified", wahFile as any);
      }

      if (formData.firstAidTraining) {
        const firstAidFile = {
          uri: formData.firstAidTraining.uri,
          name: formData.firstAidTraining.name,
          type: formData.firstAidTraining.type,
        };
        multipartFormData.append("FirstAidTraining", firstAidFile as any);
      }

      console.log("Submitting update data:", {
        ...formDataToSend,
        files: {
          photo: formData.photo ? "File attached" : "No file",
          idProof: formData.idProof ? "File attached" : "No file",
          medicalExamination: formData.medicalExamination
            ? "File attached"
            : "No file",
          policeVerification: formData.policeVerification
            ? "File attached"
            : "No file",
          safetyInduction: formData.safetyInduction
            ? "File attached"
            : "No file",
          wahCertified: formData.wahCertified ? "File attached" : "No file",
          firstAidTraining: formData.firstAidTraining
            ? "File attached"
            : "No file",
        },
      });

      const response = await httpClient.post<CWSubmitResponse>(
        API_ENDPOINTS.CW.UPDATE,
        multipartFormData,
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
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
            router.push("/(drawer)/Vendor");
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to update contract worker",
          type: "error",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      }
    } catch (error: any) {
      console.error("Error updating contract worker:", error);
      setAlert({
        visible: true,
        message:
          error.response?.data?.message || "Failed to update contract worker",
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
      <ScrollView style={styles.container}>
        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contract Worker Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contract Worker Name"
              value={formData.name}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
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
                onChange={onDobChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Joining *</Text>
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
                onChange={onDojChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGender}
                enabled={false}
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
            <Text style={styles.label}>Blood Group *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedBloodGroup}
                enabled={false}
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
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Enter Address"
              multiline
              numberOfLines={3}
              value={formData.address}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Mobile Number"
              keyboardType="numeric"
              value={formData.mobileNumber}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Spouse / Parent Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              keyboardType="numeric"
              value={formData.spouseContactNumber}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Aadhaar Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Aadhaar Number"
              keyboardType="numeric"
              value={formData.aadhaarNumber}
              editable={false}
            />
          </View>
        </View>

        {/* Job & Education Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job & Education Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Education *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Education"
              value={formData.education}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vendor Code *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedVendor}
                enabled={false}
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
            <Text style={styles.label}>Department *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Department"
              value={formData.department}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Designation *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Designation"
              value={formData.jobDesignation}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Skill Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Skill Type"
              value={formData.skillType}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Experience *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Experience"
              value={formData.experience}
              editable={false}
            />
          </View>
        </View>

        {/* Banking Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banking Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Bank Name"
              value={formData.bankName}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Account Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Bank Account Number"
              keyboardType="numeric"
              value={formData.bankAccountNumber}
              editable={false}
            />
          </View>
        </View>

        {/* EPF & ESIC Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EPF & ESIC Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>EPF Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter EPF Number"
              keyboardType="numeric"
              value={formData.epfNumber}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ESIC Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ESIC Number"
              keyboardType="numeric"
              value={formData.esicNumber}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>UAN Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter UAN Number"
              keyboardType="numeric"
              value={formData.uanNumber}
              editable={false}
            />
          </View>
        </View>

        {/* Document Uploads Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Uploads</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>CW Profile Photo *</Text>
            {selectedPhoto && (
              <TouchableOpacity
                onPress={() => handleViewDocument(selectedPhoto)}
              >
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ID Proof Detail *</Text>
            {selectedIdProof && <FilePreview file={selectedIdProof} />}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Medical Examination *</Text>
            {selectedMedicalExamination && (
              <FilePreview file={selectedMedicalExamination} />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Police Verification Report *</Text>
            {selectedPoliceVerification && (
              <FilePreview file={selectedPoliceVerification} />
            )}
          </View>
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Safety Induction *</Text>
            {selectedSafetyInduction && (
              <FilePreview file={selectedSafetyInduction} />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>WAH Certified *</Text>
            {selectedWahCertified && (
              <FilePreview file={selectedWahCertified} />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>First-Aid Training *</Text>
            {selectedFirstAidTraining && (
              <FilePreview file={selectedFirstAidTraining} />
            )}
          </View>
        </View>

        {/* Action Taken Remarks Section */}
        {cwMasterFlow && cwMasterFlow.length > 0 && (
          <>
            {cwMasterFlow.map((flow: any, index: number) => (
              <View key={flow.id}>
                <TouchableOpacity style={styles.pendingHeader}>
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
                        style={styles.input}
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
                        uri: `${baseURL}/uploads/CWFlowActionfiles/${flow.document}`,
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
            {(() => {
              console.log("Passing cwFlowId to CWForm:", cwFlowId);
              return null;
            })()}
            <CWForm
              id={cWDetails?.cwMaster.id}
              cwFlowId={cwFlowId ? cwFlowId : 0}
              initialData={cWDetails?.cwMaster}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              vendors={vendors}
            />
          </>
        )}

        <CustomAlert
          visible={alert.visible}
          message={alert.message}
          type={alert.type}
          onClose={
            alert.onClose ||
            (() => setAlert((prev) => ({ ...prev, visible: false })))
          }
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
  previewImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
});
