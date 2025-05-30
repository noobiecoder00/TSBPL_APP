import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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
  certifiedQty?: number;
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
  siteInCharge: string;
  Engineer: string;
  Supervisor: string;
  SafetyOfficer: string;
  Fitter: string;
  Rigger: string;
  Electrician: string;
  Operators_Drivers: string;
  Helper: string;
}

const initialManpowerState: ManpowerState = {
  siteInCharge: "",
  Engineer: "",
  Supervisor: "",
  SafetyOfficer: "",
  Fitter: "",
  Rigger: "",
  Electrician: "",
  Operators_Drivers: "",
  Helper: "",
};

const DailyProjectCreateForm = () => {
  const dispatch = useDispatch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dprDate, setDprDate] = useState<Date | null>(null);
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
  const [subProjectVendors, setSubProjectVendors] = useState<
    SubProjectVendor[]
  >([]);

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [keyHighlightProject, setKeyHighlightProject] = useState("");
  const [keyIssuesClient, setKeyIssuesClient] = useState("");
  const [keyIssuesTBSPL, setKeyIssuesTBSPL] = useState("");
  const [remark, setRemark] = useState("");
  const [lostTime, setLostTime] = useState("");
  const [manpower, setManpower] = useState<ManpowerState>(initialManpowerState);
  const [totalSupplyWeight, setTotalSupplyWeight] = useState("");

  // Add refs for input fields
  const projectNoRef = useRef<Picker<number | null>>(null);
  const subProjectRef = useRef<Picker<number | null>>(null);
  const dprDateRef = useRef<View>(null);
  const totalSupplyWeightRef = useRef<TextInput>(null);
  const keyHighlightProjectRef = useRef<TextInput>(null);
  const keyIssuesClientRef = useRef<TextInput>(null);
  const keyIssuesTBSPLRef = useRef<TextInput>(null);
  const remarkRef = useRef<TextInput>(null);
  const lostTimeRef = useRef<TextInput>(null);
  const manpowerRefs = {
    siteInCharge: useRef<TextInput>(null),
    Engineer: useRef<TextInput>(null),
    Supervisor: useRef<TextInput>(null),
    SafetyOfficer: useRef<TextInput>(null),
    Fitter: useRef<TextInput>(null),
    Rigger: useRef<TextInput>(null),
    Electrician: useRef<TextInput>(null),
    Operators_Drivers: useRef<TextInput>(null),
    Helper: useRef<TextInput>(null),
  };
  const scopeItemRefs = useRef<{
    [key: number]: {
      vendor: Picker<number | null>;
      certifiedQty: TextInput | null;
    };
  }>({});
  const equipmentRefs = useRef<{ [key: number]: TextInput | null }>({});

  const resetStates = () => {
    setShowDatePicker(false);
    setDprDate(null);
    setProjectNos([]);
    setSelectedProjectNo(null);
    setSubProjects([]);
    setSelectedSubProject(null);
    setProjectDetails(null);
    setSubProjectVendors([]);
    setSelectedVendor(null);
    setScopeItems([]);
    setEquipments([]);
    setError(null);
    setKeyHighlightProject("");
    setKeyIssuesClient("");
    setKeyIssuesTBSPL("");
    setRemark("");
    setLostTime("");
    setManpower(initialManpowerState);
    setTotalSupplyWeight("");
  };

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
        `${API_ENDPOINTS.SUB_PROJECT_SCOPE.LIST}?id=${selectedSubProject}`
      );
      if (response.data.success) {
        if (!response.data.data) {
          setAlert({
            visible: true,
            message: response.data.message || "Failed to submit form",
            type: "error",
          });
        } else {
          const items = response.data.data.map((item: any) => ({
            ...item,
            certifiedQty: 0,
            balanceQty: null,
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
      }
    } catch (error) {
      console.error("Error fetching scope items:", error);
      setError("Failed to load scope items. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchEquipments = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.SUB_PROJECT_EQUIPMENT.LIST}?id=${selectedSubProject}`
      );
      console.log("response", response.data);
      // Handle direct array response
      if (Array.isArray(response.data)) {
        setEquipments(response.data);
      } else {
        setEquipments([]);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
      setError("Failed to load equipments. Please try again.");
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

  const handleEquipmentCountChange = (equipmentId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEquipments((prevItems) =>
      prevItems.map((item) =>
        item.id === equipmentId ? { ...item, count: numValue } : item
      )
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
        scopeItemRefs.current[item.id]?.vendor?.focus();
        return false;
      }
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

      const formattedDate = dprDate ? dprDate.toISOString().split("T")[0] : "";

      const payload = {
        ProjectId: selectedProjectNo || 0,
        subProjectId: selectedSubProject || 0,
        DPR_Date: formattedDate,
        LostTime: lostTime,
        remark: remark,
        keyHighlightProject: keyHighlightProject,
        keyIssuesClient: keyIssuesClient,
        keyIssuesTBSPL: keyIssuesTBSPL,
        siteInCharge: manpower.siteInCharge,
        Engineer: manpower.Engineer,
        Supervisor: manpower.Supervisor,
        SafetyOfficer: manpower.SafetyOfficer,
        TotalSupplyWeight: parseFloat(totalSupplyWeight),
        Fitter: manpower.Fitter,
        Rigger: manpower.Rigger,
        Electrician: manpower.Electrician,
        Operators_Drivers: manpower.Operators_Drivers,
        Helper: manpower.Helper,
        CreatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
        Scopes: scopeItems.map((item) => ({
          Id: item.id,
          RowId: item.id,
          ScopeId: item.id,
          ScopeName: item.scopes,
          VendorId: item.selectedVendor || 0,
          ScopeQty: item.scopeQuantity,
          scopeCumQTY: item.scopeCumQuantity,
          ScopeQtyInput: item.certifiedQty || 0,
          ScopeBalancedQty: item.balanceQty || 0,
        })),
        Equipments: equipments.map((equipment) => ({
          Id: equipment.id,
          EqpId: equipment.id,
          EquipmentId: equipment.id,
          EquipmentQtyInput: equipment.count || 0,
        })),
      };

      console.log("payload", payload);

      const response = await httpClient.post(
        API_ENDPOINTS.DPR_CREATE.CREATE,
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
      fetchEquipments();
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

  return (
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
          <RequiredLabel label="DPR Date" />
          <TouchableOpacity
            ref={dprDateRef}
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{dprDate ? formatDate(dprDate) : "Select Date"}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dprDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDprDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Total Supply Weight" />
          <TextInput
            ref={totalSupplyWeightRef}
            style={styles.input}
            placeholder="Enter total supply weight"
            value={totalSupplyWeight}
            onChangeText={setTotalSupplyWeight}
            keyboardType="numeric"
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
              <Text style={styles.label}>Vendor Code</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  ref={(el) => {
                    if (el) {
                      scopeItemRefs.current[item.id] = {
                        vendor: el,
                        certifiedQty:
                          scopeItemRefs.current[item.id]?.certifiedQty || null,
                      };
                    }
                  }}
                  selectedValue={item.selectedVendor}
                  onValueChange={(value) => {
                    setScopeItems((prevItems) =>
                      prevItems.map((prevItem) =>
                        prevItem.id === item.id
                          ? { ...prevItem, selectedVendor: value }
                          : prevItem
                      )
                    );
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
                  item.certifiedQty &&
                  item.certifiedQty > item.scopeQuantity - item.scopeCumQuantity
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
                value={item.balanceQty?.toString() || ""}
                editable={false}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Key Highlights Section */}
      <View style={styles.section}>
        <View style={styles.formGroup}>
          <RequiredLabel label="Key Highlights - Project" />
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
          <RequiredLabel label="Key Issues - Client" />
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
          <RequiredLabel label="Key Issues - TBSPL" />
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
          <RequiredLabel label="Remark" />
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
          <RequiredLabel label="Lost Time" />
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
          {(Object.keys(manpower) as Array<keyof ManpowerState>).map((key) => (
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
          {equipments.map((equipment) => (
            <View key={equipment.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{equipment.equipmentName}</Text>
              <TextInput
                ref={(el) => {
                  equipmentRefs.current[equipment.id] = el;
                }}
                style={styles.tableCellInput}
                keyboardType="numeric"
                placeholder=""
                onChangeText={(value) =>
                  handleEquipmentCountChange(equipment.id, value)
                }
              />
            </View>
          ))}
        </View>
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
            onPress={() => {
              handleSubmit();
            }}
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

export default DailyProjectCreateForm;
