import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
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

interface SubProject {
  id: number;
  buildingName: string;
}

interface ProjectDetails {
  projectName: string;
  doNumber: string;
  noOfBuilding: number;
  buildingName: string;
}

interface UserData {
  id: string;
}

const DailyProjectCreateForm = () => {
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dprDate, setDprDate] = useState(new Date());
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [projectNos, setProjectNos] = useState<ProjectNo[]>([]);
  const [selectedProjectNo, setSelectedProjectNo] = useState<number | null>(
    null
  );
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [selectedSubProject, setSelectedSubProject] = useState<number | null>(
    null
  );
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const onDprDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDprDate(selectedDate);
    }
  };

  const fetchProjectNos = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(API_ENDPOINTS.PROJECT_NO.LIST);
      setProjectNos(response.data);
    } catch (error) {
      console.error("Error fetching project nos:", error);
      setError("Failed to load project nos. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchSubProjects = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.SUB_PROJECT_NO.LIST}?id=${selectedProjectNo}`
      );
      console.log("response", response.data);
      // [{"id":2,"buildingName":"Ta"}]
      setSubProjects(response.data);
    } catch (error) {
      console.error("Error fetching sub projects:", error);
      setError("Failed to load sub projects. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchProjectDetails = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `/api/SubProjectDetails?id=${selectedSubProject}`
      );
      console.log("response", response.data);
      //   [
      //     {
      //         "projectName": "TATA STEEL (JSR)",
      //         "doNumber": "7",
      //         "noOfBuilding": 711,
      //         "buildingName": "Karyn Hutchinson"
      //     }
      // ]
      setProjectDetails(response.data[0]);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Failed to load project details. Please try again.");
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

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchProjectNos();
    }, [])
  );

  useEffect(() => {
    if (selectedProjectNo) {
      fetchSubProjects();
    }
  }, [selectedProjectNo]);

  useEffect(() => {
    if (selectedSubProject) {
      fetchProjectDetails();
    }
  }, [selectedSubProject]);

  return (
    <ScrollView style={styles.container}>
      {/* Building Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Building Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Number</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProjectNo}
              onValueChange={(itemValue) => setSelectedProjectNo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Project --" value={null} />
              {projectNos.map((projectNo) => (
                <Picker.Item
                  key={projectNo.value}
                  label={projectNo.text}
                  value={projectNo.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sub Project</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubProject}
              onValueChange={(itemValue) => setSelectedSubProject(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Sub Project --" value={null} />
              {subProjects.map((subProject) => (
                <Picker.Item
                  key={subProject.id}
                  label={subProject.buildingName}
                  value={subProject.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {projectDetails && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name of Project: </Text>
              <Text style={styles.infoValue}>{projectDetails.projectName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DO Number: </Text>
              <Text style={styles.infoValue}>{projectDetails.doNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total No. of Buildings: </Text>
              <Text style={styles.infoValue}>
                {projectDetails.noOfBuilding}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Building Name(s): </Text>
              <Text style={styles.infoValue}>
                {projectDetails.buildingName}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>DPR Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(dprDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dprDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDprDateChange}
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

      {/* Key Highlights Section */}
      <View style={styles.section}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Key Highlights - Project</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Enter key highlights"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Key Issues - Client</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Enter client issues"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Key Issues - TBSPL</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Enter TBSPL issues"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Remark</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Enter remarks"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Lost Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lost time"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Manpower Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MANPOWER</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Role</Text>
            <Text style={styles.tableHeaderText}>Count</Text>
          </View>
          {[
            "Site In-charge",
            "Engineer",
            "Supervisor",
            "Safety Officer",
            "Fitter",
            "Rigger",
            "Electrician",
            "Operators / Drivers",
            "Helper",
          ].map((role, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{role}</Text>
              <TextInput
                style={styles.tableCellInput}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Equipment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EQUIPMENT</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Equipment</Text>
            <Text style={styles.tableHeaderText}>Count</Text>
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
});

export default DailyProjectCreateForm;
