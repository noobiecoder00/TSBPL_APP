import { CustomButton } from "@/components/CustomButton";
import { COLORS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

const TpiDetails = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tpiExpiryDate, setTpiExpiryDate] = useState(new Date());
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [isChecked, setIsChecked] = useState(true);

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
            value="EQP-FAR/05-25/00001"
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Equipment Category"
            value="Tools & Tackles"
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Equipment Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Equipment Name"
            value="Wire Ropes"
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput style={styles.input} value="Daily" editable={false} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Zone</Text>
          <TextInput style={styles.input} value="South" editable={false} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value="Faridabad" editable={false} />
        </View>
      </View>

      {/* Other Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Alert (Email/SMS)</Text>
          <TextInput style={styles.input} value="Yes" editable={false} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof</Text>
          <TextInput style={styles.input} value="Yes" editable={false} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Proof Uploaded</Text>
          <View style={{ marginTop: 2 }}>
            <CustomButton title="View" onPress={() => {}} variant="primary" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <TextInput style={styles.input} value="Active" editable={false} />
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

          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>30-05-2025</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Inactive</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>View</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>31-05-2025</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>Active</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableCellText}>View</Text>
            </View>
          </View>
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
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: "500",
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
});
