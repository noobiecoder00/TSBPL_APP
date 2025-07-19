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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
interface ScopeItem {
  id: number;
  scopes: string;
  uom: string;
  scopeQuantity: number;
  scopeCumQuantity: number;
  certifiedQty?: number | string;
  balanceQty?: number | null;
}

interface UserData {
  id: string;
}

interface BuilderEditFormProps {
  id: number;
  builderFlowId: number;
  initialData: {
    projectId: number;
    projectNumber: string;
    subProjectNumber: string;
    subProjectName: string;
    vendorCode: string;
    vendorName: string;
    soNumber: string;
    runningAccountNumber: string;
    runningAccountDate: Date;
    scopeItems: Array<{
      id: number;
      scopeName: string;
      scopeUOMName: string;
      scopeQty: number;
      scopeCummulativeQty: number;
      scopeCertifiedQty: number | string;
      scopeBalancedQty: number | null;
    }>;
  };
  isSubmitting: boolean;
}

const BuilderEditForm = ({
  id,
  builderFlowId,
  initialData,
  isSubmitting: propIsSubmitting,
}: BuilderEditFormProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);
  const [soNumber, setSoNumber] = useState(initialData?.soNumber);
  const [runningNumber, setRunningNumber] = useState(
    initialData?.runningAccountNumber
  );
  const [date, setDate] = useState(initialData?.runningAccountDate);
  const [showRunningAccountDatePicker, setShowRunningAccountDatePicker] =
    useState(false);

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

  // Add refs for input fields
  const scopeItemRefs = useRef<{
    [key: number]: { certifiedQty: TextInput | null };
  }>({});
  const remarksRef = useRef<TextInput>(null);

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const [flowRemarks, setFlowRemarks] = useState("");
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>(
    initialData.scopeItems.map((item) => ({
      id: item.id,
      scopes: item.scopeName,
      uom: item.scopeUOMName,
      scopeQuantity: item.scopeQty,
      scopeCumQuantity: item.scopeCummulativeQty,
      certifiedQty: item.scopeCertifiedQty,
      balanceQty: item.scopeBalancedQty,
    }))
  );

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const onRunningAccountDateChange = (event: any, selectedDate?: Date) => {
    setShowRunningAccountDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
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
            balanceQty: parseFloat(
              (balanceQty >= 0 ? balanceQty : 0).toFixed(2)
            ),
          };
        }
        return item;
      })
    );
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

  const validateForm = () => {
    if (!soNumber) {
      Alert.alert("Validation Error", "Please enter SO Number");
      return false;
    }
    if (!runningNumber) {
      Alert.alert("Validation Error", "Please enter Running Number");
      return false;
    }
    if (!date) {
      Alert.alert("Validation Error", "Please enter Running Account Date");
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

    if (!flowRemarks.trim()) {
      Alert.alert("Validation Error", "Please enter remarks.");
      remarksRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      dispatch(showLoading());

      const payload = {
        Id: id.toString(),
        SO_Number: soNumber,
        Running_Acc_No: runningNumber,
        Running_Acc_Date: date,
        UpdatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
        Builder_Flow_Id: builderFlowId.toString(),
        Builder_Flow_FlowRemarks: flowRemarks,
        Scopes: scopeItems.map((item) => ({
          RowId: item.id.toString(),
          ScopeName: item.scopes,
          ScopeQty: item.scopeQuantity,
          scopeCumQTY: item.scopeCumQuantity,
          ScopeQtyInput: item.certifiedQty || 0,
          ScopeBalancedQty: item.balanceQty || 0,
        })),
      };

      console.log(payload);

      const response = await httpClient.post(
        API_ENDPOINTS.BUILDER_BILLING.UPDATE,
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
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to update form",
          type: "error",
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
    <ScrollView style={styles.container}>
      {/* Project Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.formGroup}>
          <RequiredLabel label="Project Number" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.projectNumber}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Sub Project (DO Number)" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.subProjectNumber}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Sub Project Name" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.subProjectName}
            editable={false}
          />
        </View>
        <View style={styles.formGroup}>
          <RequiredLabel label="Vendor Code" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.vendorCode}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label="Vendor Name" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.vendorName}
            editable={false}
          />
        </View>
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
              value={date}
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
                value={`${item.scopes}`}
                multiline
                numberOfLines={3}
                onChangeText={(value) => handleScopeItemChange(item.id, value)}
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

      {/* Remarks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remarks</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            ref={remarksRef}
            style={[styles.input, styles.textArea]}
            placeholder="Enter Remarks"
            multiline
            numberOfLines={3}
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

export default BuilderEditForm;
