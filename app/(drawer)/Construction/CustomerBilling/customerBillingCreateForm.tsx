import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const CustomerBillingCreateForm = () => {
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
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

  // Add refs for input fields
  const projectNoRef = useRef<Picker<number | null>>(null);
  const subProjectRef = useRef<Picker<number | null>>(null);
  const scopeItemRefs = useRef<{
    [key: number]: { certifiedQty: TextInput | null };
  }>({});

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
    setSelectedSubProject(null);
    setProjectDetails(null);
    setScopeItems([]);
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

  const handleCertifiedQtyChange = (scopeId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setScopeItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === scopeId) {
          const balanceQty =
            item.scopeQuantity - item.scopeCumQuantity - numValue;
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
      Alert.alert("Validation Error", "Please select a project number.");
      projectNoRef.current?.focus();
      return false;
    }
    if (!selectedSubProject) {
      Alert.alert("Validation Error", "Please select a sub project.");
      subProjectRef.current?.focus();
      return false;
    }

    // Validate scope items
    for (const item of scopeItems) {
      if (
        item.certifiedQty &&
        item.certifiedQty > item.scopeQuantity - item.scopeCumQuantity
      ) {
        Alert.alert(
          "Validation Error",
          `Certified quantity cannot be greater than scope quantity for: ${item.scopes}`
        );
        scopeItemRefs.current[item.id]?.certifiedQty?.focus();
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

      const payload = {
        ProjectId: selectedProjectNo || 0,
        subProjectId: selectedSubProject || 0,
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
        API_ENDPOINTS.CUSTOMER_BILLING_CREATE.CREATE,
        payload
      );

      if (response.data.success) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
          redirect: true,
          redirectPath:
            "/(drawer)/Construction/CustomerBilling/CustomerBillingIndex",
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
      fetchScopeItems();
    }
  }, [selectedSubProject]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => router.back() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Loader />
      <ScrollView style={styles.container}>
        {/* Building Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Details</Text>
          <View style={styles.formGroup}>
            <RequiredLabel label="Project Number" />
            <View style={styles.pickerContainer}>
              <Picker
                ref={projectNoRef}
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
                ref={subProjectRef}
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

        {/* Scope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCOPE</Text>
          {scopeItems.map((item) => (
            <View key={item.id} style={styles.scopeItemContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Scope Item</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={`${item.scopes} (${item.uom})`}
                  editable={false}
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
                  ref={(el) => {
                    if (el) {
                      scopeItemRefs.current[item.id] = {
                        certifiedQty: el,
                      };
                    }
                  }}
                  style={[
                    styles.input,
                    item.certifiedQty &&
                    item.certifiedQty >
                      item.scopeQuantity - item.scopeCumQuantity
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

export default CustomerBillingCreateForm;
