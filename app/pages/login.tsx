import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string | null;
  userInfo: {
    id: number;
    name: string;
    pnoGatepassNo: string;
    role: string;
    locationIds: number[];
    accessibleActions: string[];
    force: string;
  };
}

interface VendorLoginResponse {
  success: boolean;
  message: string;
  token: string | null;
  data: {
    vendorId: number;
    vendorName: string;
    vendorCode: string;
    force: string;
  };
}

interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Asdfghjkl@123");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("User");
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [items] = useState([
    { label: "User", value: "User" },
    { label: "Vendor", value: "Vendor" },
  ]);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    loginType?: string;
  }>({});
  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    message: "",
    type: "info",
  });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; loginType?: string } =
      {};
    if (!loginType) {
      newErrors.loginType = "Login type is required";
    }
    if (!email) {
      newErrors.email = "Pno is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint =
        loginType === "User"
          ? API_ENDPOINTS.AUTH.USER_LOGIN
          : API_ENDPOINTS.AUTH.VENDOR_LOGIN;

      const payload =
        loginType === "User"
          ? {
              PnoGatepassNo: email,
              Password: password,
            }
          : {
              LoginId: email,
              Password: password,
            };

      console.log(endpoint, payload);
      const response = await httpClient.post<
        LoginResponse | VendorLoginResponse
      >(endpoint, payload, { timeout: 60000 });

      //console.log("Response received:", response.data);

      if (response.data.success) {
        let userData;

        if (loginType === "User") {
          const userResponse = response.data as LoginResponse;
          // console.log("Parsed User Response:", userResponse);
          userData = {
            id: userResponse.userInfo.id,
            name: userResponse.userInfo.name,
            pno: userResponse.userInfo.pnoGatepassNo,
            role: userResponse.userInfo.role,
            locationIds: userResponse.userInfo.locationIds,
            accessibleActions: userResponse.userInfo.accessibleActions,
            force: userResponse.userInfo.force,
            type: "User",
          };
        } else {
          const vendorResponse = response.data as VendorLoginResponse;
          // console.log("Parsed Vendor Response:", vendorResponse);
          userData = {
            id: vendorResponse.data.vendorId,
            vendorName: vendorResponse.data.vendorName,
            vendorCode: vendorResponse.data.vendorCode,
            force: vendorResponse.data.force,
            type: "Vendor",
          };
        }

        // console.log("Final userData:", userData);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        //console.log("User data saved to AsyncStorage");
        router.replace("/(drawer)/home");
        //console.log("Navigated to /home");
      } else {
        console.log("Login failed:", response.data);
        setAlert({
          visible: true,
          message: response.data.message || "Login failed. Please try again.",
          type: "error",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setAlert({
        visible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    if (!email) {
      setErrors({ email: "Pno is required" });
      return;
    }
    setShowForgotPasswordModal(true);
  };

  const handleForgotPassword = async () => {
    setShowForgotPasswordModal(false);
    setLoading(true);
    try {
      const endpoint =
        loginType === "User"
          ? API_ENDPOINTS.USER.FORGOT_PASSWORD
          : API_ENDPOINTS.VENDOR.FORGOT_PASSWORD;

      console.log(`${endpoint}/${email}`);
      const response = await httpClient.put<ForgotPasswordResponse>(
        `${endpoint}/${email}`
      );

      console.log("Response received:", response.data);

      if (response.data.status) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
        });
      } else {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "error",
        });
      }
    } catch (error: any) {
      setAlert({
        visible: true,
        message:
          error.response?.data?.message ||
          "Failed to process request. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => BackHandler.exitApp() },
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
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/tsbpl_app_icon.png")}
        style={styles.logo}
      />
      <View style={styles.formContainer}>
        <Text style={styles.label}>Login Type</Text>
        <DropDownPicker
          open={open}
          value={loginType}
          items={items}
          setOpen={setOpen}
          setValue={setLoginType}
          style={[styles.dropdown, errors.loginType && styles.inputError]}
          textStyle={styles.dropdownText}
          placeholder="Select login type"
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={1000}
        />
        {errors.loginType && (
          <Text style={styles.errorText}>{errors.loginType}</Text>
        )}

        <Text style={styles.label}>Pno</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your Pno"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, errors.password && styles.inputError]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <View style={styles.buttonContainer}>
          <CustomButton title="Login" onPress={handleLogin} loading={loading} />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Forgot Password"
            variant="secondary"
            onPress={handleForgotPasswordClick}
            loading={loading}
          />
        </View>
      </View>

      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reset your password?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowForgotPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleForgotPassword}
              >
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.large,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: -40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 10,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 12,
  },
  dropdown: {
    height: 48,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownContainer: {
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
});
