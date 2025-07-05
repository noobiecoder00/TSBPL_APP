import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

interface SubProject {
  id: number;
  buildingName: string;
}

interface SubProjectVendor {
  id: number;
  vendorDetails: string;
}

interface Equipment {
  id: number;
  equipmentName: string;
  count?: number;
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

interface ManpowerState {
  "Site In Charge": string;
  Engineer: string;
  Supervisor: string;
  "Safety Officer": string;
  Fitter: string;
  Rigger: string;
  Electrician: string;
  "Operators & Drivers": string;
  Helper: string;
}

interface VendorDropdown {
  disabled: boolean;
  group: string | null;
  selected: boolean;
  text: string;
  value: string;
}

const initialManpowerState: ManpowerState = {
  "Site In Charge": "",
  Engineer: "",
  Supervisor: "",
  "Safety Officer": "",
  Fitter: "",
  Rigger: "",
  Electrician: "",
  "Operators & Drivers": "",
  Helper: "",
};

interface DPREditFormProps {
  id: number;
  dprFlowId: number;
  initialData: {
    projectName: string;
    projectNumber: string;
    projectId: number;
    subProjectId: number;
    dprDate: string;
    totalSupplyWeight: number;
    keyHighlightProject: string;
    keyIssuesClient: string;
    keyIssuesTBSPL: string;
    remark: string;
    lostTime: string;
    manpower: ManpowerState;
    scopeItems: Array<{
      id: number;
      scopeName: string;
      scopeUOMName: string;
      scopeQty: number;
      scopeCummulativeQty: number;
      scopeCertifiedQty: number | string;
      scopeBalancedQty: number | null;
      vendorId: number;
    }>;
    equipments: Array<{
      id: number;
      equipmentName: string;
      count: number;
    }>;
  };
  vendor: VendorDropdown[];
  isSubmitting: boolean;
}

const DPREditForm = ({
  id,
  dprFlowId,
  initialData,
  vendor,
  isSubmitting: propIsSubmitting,
}: DPREditFormProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dprDate, setDprDate] = useState(new Date(initialData.dprDate));
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);

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
  });

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );
  const [keyHighlightProject, setKeyHighlightProject] = useState(
    initialData.keyHighlightProject
  );
  const [keyIssuesClient, setKeyIssuesClient] = useState(
    initialData.keyIssuesClient
  );
  const [keyIssuesTBSPL, setKeyIssuesTBSPL] = useState(
    initialData.keyIssuesTBSPL
  );
  const [flowRemarks, setFlowRemarks] = useState("");
  const [remark, setRemark] = useState(initialData.remark);
  const [lostTime, setLostTime] = useState(initialData.lostTime);
  const [manpower, setManpower] = useState<ManpowerState>(initialData.manpower);
  const [totalSupplyWeight, setTotalSupplyWeight] = useState(
    initialData.totalSupplyWeight.toString()
  );
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>(
    initialData.scopeItems.map((item) => ({
      id: item.id,
      scopes: item.scopeName,
      uom: item.scopeUOMName,
      scopeQuantity: item.scopeQty,
      scopeCumQuantity: item.scopeCummulativeQty,
      certifiedQty: item.scopeCertifiedQty,
      balanceQty: item.scopeBalancedQty,
      selectedVendor: item.vendorId,
    }))
  );
  const [equipments, setEquipments] = useState<Equipment[]>(
    initialData.equipments.map((eq) => ({
      id: eq.id,
      equipmentName: eq.equipmentName,
      count: eq.count,
    }))
  );

  // Add refs for input fields
  const dprDateRef = useRef<View>(null);
  const projectNoDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const subProjectDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const totalSupplyWeightRef = useRef<TextInput>(null);
  const keyHighlightProjectRef = useRef<TextInput>(null);
  const keyIssuesClientRef = useRef<TextInput>(null);
  const keyIssuesTBSPLRef = useRef<TextInput>(null);
  const remarkRef = useRef<TextInput>(null);
  const lostTimeRef = useRef<TextInput>(null);
  const manpowerRefs = {
    "Site In Charge": useRef<TextInput>(null),
    Engineer: useRef<TextInput>(null),
    Supervisor: useRef<TextInput>(null),
    "Safety Officer": useRef<TextInput>(null),
    Fitter: useRef<TextInput>(null),
    Rigger: useRef<TextInput>(null),
    Electrician: useRef<TextInput>(null),
    "Operators & Drivers": useRef<TextInput>(null),
    Helper: useRef<TextInput>(null),
  };
  const scopeItemRefs = useRef<{
    [key: number]: {
      vendor: any;
      certifiedQty: TextInput | null;
    };
  }>({});
  const equipmentRefs = useRef<{ [key: number]: TextInput | null }>({});
  const flowRemarksRef = useRef<TextInput>(null);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const onDprDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDprDate(selectedDate);
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

  const handleEquipmentCountChange = (equipmentId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEquipments((prevItems) =>
      prevItems.map((item) =>
        item.id === equipmentId ? { ...item, count: numValue } : item
      )
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
            backHandler.remove();
            router.replace(
              "/(drawer)/Construction/DailyProjectProgressEntry/DailyProjectIndex"
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

  const validateForm = () => {
    if (!dprDate) {
      Alert.alert("Validation Error", "Please select a DPR date.");
      setShowDatePicker(true);
      return false;
    }
    if (!totalSupplyWeight.trim()) {
      Alert.alert("Validation Error", "Please enter total supply weight.");
      totalSupplyWeightRef.current?.focus();
      return false;
    }
    if (!keyHighlightProject.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter key highlights for the project."
      );
      keyHighlightProjectRef.current?.focus();
      return false;
    }
    if (!keyIssuesClient.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter key issues for the client."
      );
      keyIssuesClientRef.current?.focus();
      return false;
    }
    if (!keyIssuesTBSPL.trim()) {
      Alert.alert("Validation Error", "Please enter key issues for TBSPL.");
      keyIssuesTBSPLRef.current?.focus();
      return false;
    }
    if (!remark.trim()) {
      Alert.alert("Validation Error", "Please enter remarks.");
      remarkRef.current?.focus();
      return false;
    }
    if (!lostTime.trim()) {
      Alert.alert("Validation Error", "Please enter lost time.");
      lostTimeRef.current?.focus();
      return false;
    }

    // Validate manpower fields
    const manpowerFields = Object.entries(manpower);
    for (const [key, value] of manpowerFields) {
      if (!value.trim()) {
        Alert.alert(
          "Validation Error",
          `Please enter count for ${key.replace(/([A-Z])/g, " $1").trim()}`
        );
        manpowerRefs[key as keyof typeof manpowerRefs].current?.focus();
        return false;
      }
    }

    // Validate scope items
    for (const item of scopeItems) {
      if (!item.selectedVendor) {
        Alert.alert(
          "Validation Error",
          `Please select a vendor for scope item: ${item.scopes}`
        );
        return false;
      }
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

    // Validate equipment quantities
    for (const equipment of equipments) {
      if (
        equipment.count === undefined ||
        equipment.count === null ||
        equipment.count < 0
      ) {
        Alert.alert(
          "Validation Error",
          `Please enter a valid count for equipment: ${equipment.equipmentName}`
        );
        equipmentRefs.current[equipment.id]?.focus();
        return false;
      }
    }

    if (!flowRemarks.trim()) {
      Alert.alert("Validation Error", "Please enter remarks.");
      flowRemarksRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      console.log("Form is not valid");
      return;
    }

    try {
      dispatch(showLoading());
      const formattedDate = dprDate.toISOString().split("T")[0];

      const payload = {
        Id: id.toString(),
        DPR_Date: formattedDate,
        TotalSupplyWeight: totalSupplyWeight,
        keyHighlightProject: keyHighlightProject,
        keyIssuesClient: keyIssuesClient,
        keyIssuesTBSPL: keyIssuesTBSPL,
        remark: remark,
        LostTime: lostTime,
        siteInCharge: manpower["Site In Charge"],
        Engineer: manpower["Engineer"],
        Supervisor: manpower["Supervisor"],
        SafetyOfficer: manpower["Safety Officer"],
        Fitter: manpower["Fitter"],
        Rigger: manpower["Rigger"],
        Electrician: manpower["Electrician"],
        Operators_Drivers: manpower["Operators & Drivers"],
        Helper: manpower["Helper"],
        UpdatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
        DPR_Flow_Id: dprFlowId.toString(),
        DPR_FlowRemarks: flowRemarks,
        Scopes: scopeItems.map((item) => ({
          RowId: item.id.toString(),
          VendorId: item.selectedVendor?.toString() || "0",
          ScopeQty: item.scopeQuantity,
          scopeCumQTY: item.scopeCumQuantity,
          ScopeQtyInput: item.certifiedQty || 0,
          ScopeBalancedQty: item.balanceQty || 0,
        })),
        Equipments: equipments.map((equipment) => ({
          EqpId: equipment.id.toString(),
          EquipmentQtyInput: equipment.count?.toString() || "0",
        })),
      };

      console.log(payload);

      const response = await httpClient.post(
        API_ENDPOINTS.DPR_UPDATE.UPDATE,
        payload
      );

      if (response.data.success) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
          redirect: true,
          redirectPath:
            "/(drawer)/Construction/DailyProjectProgressEntry/DailyProjectIndex",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to update form",
          type: "error",
          redirect: true,
          redirectPath:
            "/(drawer)/Construction/DailyProjectProgressEntry/DailyProjectIndex",
        });
      }
    } catch (error) {
      console.error("Error updating form:", error);
      setAlert({
        visible: true,
        message: "Failed to update form. Please try again.",
        type: "error",
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

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AutocompleteDropdownContextProvider>
      <ScrollView style={styles.container}>
        {/* Building Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Details</Text>
          <View style={styles.formGroup}>
            <RequiredLabel label="Project Number" />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={initialData?.projectNumber}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="Name of Project" />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={initialData?.projectName}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <RequiredLabel label="DPR Date" />
            <TouchableOpacity
              style={[styles.input, styles.disabledInput]}
              // onPress={() => setShowDatePicker(true)}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Supply Weight</Text>
            <TextInput
              ref={totalSupplyWeightRef}
              style={[styles.input, styles.disabledInput]}
              placeholder="Enter total supply weight"
              value={totalSupplyWeight}
              onChangeText={setTotalSupplyWeight}
              keyboardType="decimal-pad"
              editable={false}
            />
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
                  style={[styles.input, styles.disabledInput]}
                  value={`${item.scopes} (${item.uom})`}
                  editable={false}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vendor Code *</Text>
                <AutocompleteDropdown
                  ref={(el) => {
                    if (el) {
                      scopeItemRefs.current[item.id] = {
                        vendor: el,
                        certifiedQty:
                          scopeItemRefs.current[item.id]?.certifiedQty || null,
                      };
                    }
                  }}
                  initialValue={item.selectedVendor?.toString()}
                  onSelectItem={(selectedItem) => {
                    if (selectedItem) {
                      setScopeItems((prevItems) =>
                        prevItems.map((prevItem) =>
                          prevItem.id === item.id
                            ? {
                                ...prevItem,
                                selectedVendor: parseInt(selectedItem.id),
                              }
                            : prevItem
                        )
                      );
                    } else {
                      setScopeItems((prevItems) =>
                        prevItems.map((prevItem) =>
                          prevItem.id === item.id
                            ? { ...prevItem, selectedVendor: null }
                            : prevItem
                        )
                      );
                    }
                  }}
                  dataSet={vendor.map((v) => ({
                    id: v.value,
                    title: v.text,
                  }))}
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
                      No vendors found
                    </Text>
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
                    if (el) {
                      scopeItemRefs.current[item.id] = {
                        ...(scopeItemRefs.current[item.id] || {}),
                        certifiedQty: el,
                      };
                    }
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

        {/* Key Highlights Section */}
        <View style={styles.section}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Key Highlights - Project</Text>
            <TextInput
              ref={keyHighlightProjectRef}
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="Enter key highlights"
              value={keyHighlightProject}
              onChangeText={setKeyHighlightProject}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Key Issues - Client</Text>
            <TextInput
              ref={keyIssuesClientRef}
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="Enter client issues"
              value={keyIssuesClient}
              onChangeText={setKeyIssuesClient}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Key Issues - TBSPL</Text>
            <TextInput
              ref={keyIssuesTBSPLRef}
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="Enter TBSPL issues"
              value={keyIssuesTBSPL}
              onChangeText={setKeyIssuesTBSPL}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Remark</Text>
            <TextInput
              ref={remarkRef}
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="Enter remarks"
              value={remark}
              onChangeText={setRemark}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lost Time</Text>
            <TextInput
              ref={lostTimeRef}
              style={styles.input}
              placeholder="Enter lost time"
              value={lostTime}
              onChangeText={setLostTime}
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
            {(Object.keys(manpower) as Array<keyof ManpowerState>).map(
              (key) => (
                <View key={key} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <TextInput
                    ref={manpowerRefs[key]}
                    style={styles.tableCellInput}
                    keyboardType="numeric"
                    placeholder=""
                    value={manpower[key]}
                    onChangeText={(newValue) =>
                      setManpower((prev) => ({ ...prev, [key]: newValue }))
                    }
                  />
                </View>
              )
            )}
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
            {equipments.map((equipment) => (
              <View key={equipment.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{equipment.equipmentName}</Text>
                <TextInput
                  ref={(el) => {
                    if (el) {
                      equipmentRefs.current[equipment.id] = el;
                    }
                  }}
                  style={styles.tableCellInput}
                  keyboardType="numeric"
                  placeholder=""
                  value={equipment.count?.toString()}
                  onChangeText={(value) =>
                    handleEquipmentCountChange(equipment.id, value)
                  }
                />
              </View>
            ))}
          </View>
        </View>

        {/* Remarks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remarks</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter Remarks"
              multiline
              numberOfLines={3}
              ref={flowRemarksRef}
              value={flowRemarks}
              onChangeText={(text) => setFlowRemarks(text)}
            />
          </View>
        </View>

        {/* Buttons */}
        {isSubmitting ? (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <CustomButton
                title="Submitting..."
                onPress={() => {}}
                variant="primary"
              />
            </View>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <CustomButton
                title="Update"
                onPress={handleUpdate}
                variant="primary"
                disabled={isSubmitting}
              />
            </View>
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
    padding: 2,
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
  buttonWrapper: {
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

export default DPREditForm;
