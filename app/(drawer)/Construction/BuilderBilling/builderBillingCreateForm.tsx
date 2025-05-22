import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import React, { useCallback, useEffect, useState } from "react";
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

interface ProjectNo {
  value: number;
  text: string;
}

interface SubProjectVendor {
  id: number;
  vendorDetails: string;
}

interface SubProject {
  id: number;
  buildingName: string;
}

interface ScopeItem {
  id: number;
  scopes: string;
  uom: string;
  scopeQuantity: number;
  scopeCumQuantity: number;
  certifiedQty?: number;
  balanceQty?: number;
  selectedVendor?: number | null;
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

const BuilderBillingCreateForm = () => {
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRunningAccountDatePicker, setShowRunningAccountDatePicker] =
    useState(false);
  const [projectNos, setProjectNos] = useState<ProjectNo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [subProjectVendors, setSubProjectVendors] = useState<
    SubProjectVendor[]
  >([]);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [soNumber, setSoNumber] = useState<string>("");
  const [runningNumber, setRunningNumber] = useState<string>("");

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
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

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const resetStates = () => {
    setProjectNos([]);
    setSelectedProjectNo(null);
    setSubProjects([]);
    setSubProjectVendors([]);
    setSelectedSubProject(null);
    setProjectDetails(null);
    setScopeItems([]);
    setDate(null);
    setSoNumber("");
    setRunningNumber("");
  };

  const onRunningAccountDateChange = (event: any, selectedDate?: Date) => {
    setShowRunningAccountDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
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
      setProjectDetails(response.data[0]);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Failed to load project details. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchSubProjectVendors = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.SUB_PROJECT_VENDOR.LIST}?id=${selectedSubProject}`
      );
      //[{"id":5,"vendorDetails":"Vendor 2 (Tana Bass)"}]
      setSubProjectVendors(response.data);
    } catch (error) {
      console.error("Error fetching sub project vendors:", error);
      setError("Failed to load sub project vendors. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchScopeItems = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.CUSTOMER_BILLING_SCOPE.LIST}?id=${selectedSubProject}`
      );
      if (response.data.success) {
        const items = response.data.data.map((item: any) => ({
          ...item,
          certifiedQty: 0,
          balanceQty: item.scopeQuantity,
          selectedVendor: null,
        }));
        setScopeItems(items);
      }
    } catch (error) {
      console.error("Error fetching scope items:", error);
      setError("Failed to load scope items. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleScopeItemChange = (scopeId: number, value: string) => {
    setScopeItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === scopeId) {
          return { ...item, scopes: value };
        }
        return item;
      })
    );
  };

  const handleCertifiedQtyChange = (scopeId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setScopeItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === scopeId) {
          const balanceQty =
            item.scopeQuantity - (item.scopeCumQuantity + numValue);
          return {
            ...item,
            certifiedQty: numValue,
            balanceQty: balanceQty >= 0 ? balanceQty : 0,
          };
        }
        return item;
      })
    );
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

  const validateForm = () => {
    if (!selectedProjectNo) {
      Alert.alert("Please select a project number.");
      return false;
    }
    if (!selectedSubProject) {
      Alert.alert("Please select a sub project.");
      return false;
    }

    if (!soNumber) {
      Alert.alert("Please enter SO Number.");
      return false;
    }

    if (!runningNumber) {
      Alert.alert("Please enter Running Number.");
      return false;
    }
    // Validate scope items
    for (const item of scopeItems) {
      if (!item.certifiedQty || item.certifiedQty <= 0) {
        Alert.alert(
          `Please enter certified quantity for scope item: ${item.scopes}`
        );
        return false;
      }
      if (item.certifiedQty > item.scopeQuantity) {
        Alert.alert(
          `Certified quantity cannot be greater than scope quantity for: ${item.scopes}`
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

      const formattedDate = date ? date.toISOString().split("T")[0] : "";

      const payload = {
        ProjectId: selectedProjectNo || 0,
        subProjectId: selectedSubProject || 0,
        SO_Number: soNumber,
        Running_Acc_No: runningNumber,
        Running_Acc_Date: formattedDate,
        VendorId: selectedVendor || 0,
        CreatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
        Scopes: scopeItems.map((item) => ({
          ScopeId: item.id,
          ScopeName: item.scopes,
          ScopeQty: item.scopeQuantity,
          scopeCumQTY: item.scopeCumQuantity,
          ScopeQtyInput: item.certifiedQty || 0,
          ScopeBalancedQty: item.balanceQty || 0,
        })),
      };

      console.log("payload", payload);

      const response = await httpClient.post(
        API_ENDPOINTS.BUILDER_BILLING.CREATE,
        payload
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
            resetStates();
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to submit form",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlert({
        visible: true,
        message: "Failed to submit form. Please try again.",
        type: "error",
      });
    } finally {
      dispatch(hideLoading());
      setIsSubmitting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetStates();
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
      fetchSubProjectVendors();
      fetchScopeItems();
    }
  }, [selectedSubProject]);

  return (
    <View style={{ flex: 1 }}>
      <Loader />
      <ScrollView style={styles.container}>
        {/* Project Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.formGroup}>
            <RequiredLabel label="Project Number" />
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
            <RequiredLabel label="Sub Project" />
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

          <View style={styles.formGroup}>
            <RequiredLabel label="Vendor Code" />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedVendor}
                onValueChange={(value) => {
                  setSelectedVendor(value);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Vendor" value={null} />
                {subProjectVendors.map((vendor) => (
                  <Picker.Item
                    key={vendor.id}
                    label={vendor.vendorDetails}
                    value={vendor.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {projectDetails && (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name of Project: </Text>
                <Text style={styles.infoValue}>
                  {projectDetails.projectName}
                </Text>
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
        </View>

        {/* Building Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Details</Text>
          <View style={styles.formGroup}>
            <RequiredLabel label="SO Number" />
            <TextInput
              style={styles.input}
              value={soNumber}
              onChangeText={(value) => setSoNumber(value)}
            />
          </View>
          <View style={styles.formGroup}>
            <RequiredLabel label="Running Number" />
            <TextInput
              style={styles.input}
              value={runningNumber}
              onChangeText={(value) => setRunningNumber(value)}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Running Account Date" />
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowRunningAccountDatePicker(true)}
            >
              <Text>{formatDate(date || new Date())}</Text>
            </TouchableOpacity>
            {showRunningAccountDatePicker && (
              <DateTimePicker
                value={date || new Date()}
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
          {scopeItems.map((item) => (
            <View key={item.id} style={styles.scopeItemContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Scope Item</Text>
                <TextInput
                  style={[styles.input]}
                  value={item.scopes}
                  onChangeText={(value) =>
                    handleScopeItemChange(item.id, value)
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Scope Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.scopeQuantity.toString()}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cumulative Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.scopeCumQuantity.toString()}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Certified Qty</Text>
                <TextInput
                  style={[
                    styles.input,
                    item.certifiedQty && item.certifiedQty > item.scopeQuantity
                      ? styles.errorInput
                      : null,
                  ]}
                  value={item.certifiedQty?.toString() || ""}
                  onChangeText={(value) =>
                    handleCertifiedQtyChange(item.id, value)
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Balance Qty</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={item.balanceQty?.toString() || "0"}
                  editable={false}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        {isSubmitting ? (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Submitting..."
              onPress={() => {}}
              variant="primary"
            />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Submit"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
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
  },
  errorInput: {
    borderColor: "red",
    color: "red",
  },
  required: {
    color: "red",
  },
});

export default BuilderBillingCreateForm;
