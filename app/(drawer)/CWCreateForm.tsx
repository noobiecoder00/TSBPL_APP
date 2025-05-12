import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Vendor {
  id: number;
  name: string;
}

export default function CWCreateForm() {
  const [dob, setDob] = useState(new Date());
  const [doj, setDoj] = useState(new Date());
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

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await httpClient.get(API_ENDPOINTS.VENDOR.LIST);
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to load vendors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  return (
    <ScrollView style={styles.container}>
      {/* Personal Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contract Worker Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Contract Worker Name"
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
          <Text style={styles.label}>Blood Group *</Text>
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
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter Address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Spouse / Parent Contact Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Contact Number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Aadhaar Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Aadhaar Number"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Job & Education Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job & Education Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Education *</Text>
          <TextInput style={styles.input} placeholder="Enter Education" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vendor Code *</Text>
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
          <Text style={styles.label}>Department *</Text>
          <TextInput style={styles.input} placeholder="Enter Department" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Job Designation *</Text>
          <TextInput style={styles.input} placeholder="Enter Designation" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Skill Type *</Text>
          <TextInput style={styles.input} placeholder="Enter Skill Type" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Experience *</Text>
          <TextInput style={styles.input} placeholder="Enter Experience" />
        </View>
      </View>

      {/* Banking Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banking Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bank Name *</Text>
          <TextInput style={styles.input} placeholder="Enter Bank Name" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bank Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Bank Account Number"
            keyboardType="numeric"
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
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ESIC Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ESIC Number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>UAN Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter UAN Number"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Document Uploads Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Uploads</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>CW Profile Photo *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ID Proof Detail *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Medical Examination *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Police Verification Report *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Certifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Safety Induction *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>WAH Certified *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First-Aid Training *</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <CustomButton title="Back" onPress={() => {}} variant="secondary" />
        </View>
        <View style={styles.buttonWrapper}>
          <CustomButton title="Submit" onPress={() => {}} variant="primary" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
