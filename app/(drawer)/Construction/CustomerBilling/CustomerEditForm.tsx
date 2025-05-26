import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

interface UserData {
  id: string;
}

interface CustomerEditFormProps {
  id: number;
  customerFlowId: number;
  initialData: {
    projectId: number;
    projectNumber: string;
    subProjectNumber: string;
    scopeItems: Array<{
      id: number;
      scopeName: string;
      scopeUOMName: string;
      scopeQty: number;
      scopeCummulativeQty: number;
      scopeCertifiedQty: number;
      scopeBalancedQty: number;
    }>;
  };
  isSubmitting: boolean;
}

const CustomerEditForm = ({
  id,
  customerFlowId,
  initialData,
  isSubmitting: propIsSubmitting,
}: CustomerEditFormProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  const validateForm = () => {
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
        UpdatedBy: userData?.id
          ? Buffer.from(userData.id.toString(), "utf-8").toString("base64")
          : "",
        Customer_Flow_Id: customerFlowId.toString(),
        Customer_Flow_FlowRemarks: flowRemarks,
        Scopes: scopeItems.map((item) => ({
          RowId: item.id.toString(),
          VendorId: item.selectedVendor?.toString() || "0",
          ScopeQty: item.scopeQuantity,
          scopeCumQTY: item.scopeCumQuantity,
          ScopeQtyInput: item.certifiedQty || 0,
          ScopeBalancedQty: item.balanceQty || 0,
        })),
      };

      console.log(payload);

      const response = await httpClient.post(
        API_ENDPOINTS.CUSTOMER_BILLING_UPDATE.UPDATE,
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
          <RequiredLabel label="Sub Project (DO Number)" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={initialData?.subProjectNumber}
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

export default CustomerEditForm;
