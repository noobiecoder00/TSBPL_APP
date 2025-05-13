import { CustomButton } from "@/components/CustomButton";
import { COLORS, SIZES } from "@/constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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

const BuilderBillingCreateForm = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [runningAccountDate, setRunningAccountDate] = useState(new Date());
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const onRunningAccountDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setRunningAccountDate(selectedDate);
    }
  };
  return (
    <ScrollView style={styles.container}>
      {/* Project Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Number</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.picker}>
              <Picker.Item label="-- Select Project --" value="" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sub Project Number(DO Number)</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.picker}>
              <Picker.Item label="-- Select Sub Project --" value="" />
            </Picker>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Name of Project: </Text>
          <Text style={styles.infoText}>DO Number: </Text>
          <Text style={styles.infoText}>Total No. of Buildings: </Text>
          <Text style={styles.infoText}>Building Name(s): </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vendor</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.picker}>
              <Picker.Item label="-- Select Vendor --" value="" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Building Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Building Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>SO Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter SO Number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Running Account Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Running Account Number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Running Account Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(runningAccountDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={runningAccountDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onRunningAccountDateChange}
            />
          )}
        </View>
      </View>

      {/* Scope Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SCOPE</Text>
        {/* <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Scope Item</Text>
            <Text style={styles.tableHeaderText}>Vendor</Text>
            <Text style={styles.tableHeaderText}>Scope Qty</Text>
            <Text style={styles.tableHeaderText}>Cumulative Qty</Text>
            <Text style={styles.tableHeaderText}>Certified Qty</Text>
            <Text style={styles.tableHeaderText}>Balance Qty</Text>
          </View>
        </View> */}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <CustomButton title="Submit" onPress={() => {}} variant="primary" />
      </View>
    </ScrollView>
  );
};

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
});

export default BuilderBillingCreateForm;
