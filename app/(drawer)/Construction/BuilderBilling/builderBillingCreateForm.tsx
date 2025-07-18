import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Buffer } from "buffer";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AutocompleteDropdown,
  AutocompleteDropdownContextProvider,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
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
  certifiedQty?: number | string;
  balanceQty?: number | null;
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

  // Add refs for input fields
  const projectNoRef = useRef(null);
  const subProjectRef = useRef(null);
  const vendorRef = useRef(null);
  const projectNoDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const subProjectDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const vendorDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const soNumberRef = useRef<TextInput>(null);
  const runningNumberRef = useRef<TextInput>(null);
  const scopeItemRefs = useRef<{
    [key: number]: { certifiedQty: TextInput | null };
  }>({});

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
    // Reset dropdown controllers
    projectNoDropdownController.current?.clear();
    subProjectDropdownController.current?.clear();
    vendorDropdownController.current?.clear();
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

  // Transform data for autocomplete dropdown
  const projectNoItems = projectNos.map((project) => ({
    id: project.value.toString(),
    title: project.text,
  }));

  const subProjectItems = subProjects.map((subProject) => ({
    id: subProject.id.toString(),
    title: subProject.buildingName,
  }));

  const subProjectVendorsItems = subProjectVendors.map((subProjectVendor) => ({
    id: subProjectVendor.id.toString(),
    title: subProjectVendor.vendorDetails,
  }));

  const fetchScopeItems = async () => {
    setScopeItems([]);
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.BUILDER_BILLING.SCOPE}?SubProjectId=${selectedSubProject}&VendorId=${selectedVendor}`
      );
      if (response.data.success) {
        if (!response.data.data) {
          setAlert({
            visible: true,
            message: response.data.message || "Failed to submit form",
            type: "error",
          });
          setScopeItems([]);
        } else {
          const items = response.data.data.map((item: any) => ({
            ...item,
            certifiedQty: "",
            balanceQty: "Auto Calculate",
            selectedVendor: null,
          }));
          setScopeItems(items);
        }
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to submit form",
          type: "error",
        });
        setScopeItems([]);
      }
    } catch (error) {
      console.error("Error fetching scope items:", error);
      setError("Failed to load scope items. Please try again.");
      setScopeItems([]);
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
            item.scopeQuantity - item.scopeCumQuantity - numValue;
          return {
            ...item,
            certifiedQty: value,
            balanceQty: parseFloat(
              (balanceQty >= 0 ? balanceQty : 0).toFixed(2)
            ),
          };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "YES",
          onPress: () => {
            // Remove back handler before navigating
            backHandler.remove();
            router.replace(
              "/(drawer)/Construction/BuilderBilling/BuilderBillingIndex"
            );
          },
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
  }, []);

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
      projectNoDropdownController.current?.toggle();
      return false;
    }
    if (!selectedSubProject) {
      Alert.alert("Validation Error", "Please select a sub project.");
      subProjectDropdownController.current?.toggle();
      return false;
    }
    if (!selectedVendor) {
      Alert.alert("Validation Error", "Please select a vendor.");
      vendorDropdownController.current?.toggle();
      return false;
    }
    if (!soNumber.trim()) {
      Alert.alert("Validation Error", "Please enter SO Number.");
      soNumberRef.current?.focus();
      return false;
    }
    if (!runningNumber.trim()) {
      Alert.alert("Validation Error", "Please enter Running Number.");
      runningNumberRef.current?.focus();
      return false;
    }
    if (!date) {
      Alert.alert("Validation Error", "Please select Running Account Date.");
      setShowRunningAccountDatePicker(true);
      return false;
    }

    // Validate scope items
    for (const item of scopeItems) {
      if (
        item.certifiedQty &&
        (item.certifiedQty as number) >
          item.scopeQuantity - item.scopeCumQuantity
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
      setSelectedVendor(null);
    }
  }, [selectedSubProject]);

  useEffect(() => {
    if (selectedVendor) {
      console.log("selectedVendor", selectedVendor);
      fetchScopeItems();
    }
  }, [selectedVendor]);

  return (
    <AutocompleteDropdownContextProvider>
      <Loader />
      <ScrollView style={styles.container}>
        {/* Project Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.formGroup}>
            <RequiredLabel label="Project Number" />
            <AutocompleteDropdown
              ref={projectNoRef}
              controller={(controller) => {
                projectNoDropdownController.current = controller;
              }}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={
                selectedProjectNo ? selectedProjectNo.toString() : undefined
              }
              onSelectItem={(item) => {
                if (item) {
                  setSelectedProjectNo(parseInt(item.id));
                } else {
                  setSelectedProjectNo(null);
                }
              }}
              dataSet={projectNoItems}
              containerStyle={styles.dropdownContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              textInputProps={{
                placeholder: "-- Select Project --",
                style: styles.dropdownTextInput,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: COLORS.background,
              }}
              suggestionsListTextStyle={{
                color: COLORS.text,
              }}
              EmptyResultComponent={
                <Text style={{ padding: 10, fontSize: SIZES.medium }}>
                  No projects found
                </Text>
              }
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Sub Project" />
            <AutocompleteDropdown
              ref={subProjectRef}
              controller={(controller) => {
                subProjectDropdownController.current = controller;
              }}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={
                selectedSubProject ? selectedSubProject.toString() : undefined
              }
              onSelectItem={(item) => {
                if (item) {
                  setSelectedSubProject(parseInt(item.id));
                } else {
                  setSelectedSubProject(null);
                }
              }}
              dataSet={subProjectItems}
              containerStyle={styles.dropdownContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              textInputProps={{
                placeholder: "-- Select Project --",
                style: styles.dropdownTextInput,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: COLORS.background,
              }}
              suggestionsListTextStyle={{
                color: COLORS.text,
              }}
              EmptyResultComponent={
                <Text style={{ padding: 10, fontSize: SIZES.medium }}>
                  No sub projects found
                </Text>
              }
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Vendor Code" />
            <AutocompleteDropdown
              ref={vendorRef}
              controller={(controller) => {
                vendorDropdownController.current = controller;
              }}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={
                selectedVendor ? selectedVendor.toString() : undefined
              }
              onSelectItem={(item) => {
                if (item) {
                  // Ensure the ID is parsed as a number
                  setSelectedVendor(parseInt(item.id));
                } else {
                  setSelectedVendor(null);
                }
              }}
              dataSet={subProjectVendorsItems}
              containerStyle={styles.dropdownContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              textInputProps={{
                placeholder: "-- Select Project --",
                style: styles.dropdownTextInput,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: COLORS.background,
              }}
              suggestionsListTextStyle={{
                color: COLORS.text,
              }}
              EmptyResultComponent={
                <Text style={{ padding: 10, fontSize: SIZES.medium }}>
                  No sub projects found
                </Text>
              }
            />
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
              ref={soNumberRef}
              style={styles.input}
              value={soNumber}
              onChangeText={(value) => setSoNumber(value)}
            />
          </View>
          <View style={styles.formGroup}>
            <RequiredLabel label="Running Number" />
            <TextInput
              ref={runningNumberRef}
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
          {scopeItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.scopeItemContainer}>
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
                  ref={(el) => {
                    scopeItemRefs.current[item.id] = {
                      ...(scopeItemRefs.current[item.id] || {}),
                      certifiedQty: el,
                    };
                  }}
                  style={[
                    styles.input,
                    item.certifiedQty !== undefined &&
                    parseFloat(item.certifiedQty as string) >
                      item.scopeQuantity - item.scopeCumQuantity
                      ? styles.errorInput
                      : null,
                  ]}
                  value={item.certifiedQty?.toString() || ""}
                  onChangeText={(value) =>
                    handleCertifiedQtyChange(item.id, value)
                  }
                  keyboardType="decimal-pad"
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
    </AutocompleteDropdownContextProvider>
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
  dropdownContainer: {
    flex: 1,
    width: "100%",
    zIndex: 10,
  },
  dropdownInputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: 10,
  },
  dropdownTextInput: {
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    width: "100%",
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
