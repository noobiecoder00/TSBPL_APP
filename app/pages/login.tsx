import { CustomAlert } from "@/components/CustomAlert";
import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

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
  };
}

interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
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
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          PnoGatepassNo: email,
          Password: password,
        }
      );

      if (response.data.success) {
        const userData = {
          id: response.data.userInfo.id,
          name: response.data.userInfo.name,
          pno: response.data.userInfo.pnoGatepassNo,
          role: response.data.userInfo.role,
          locationIds: response.data.userInfo.locationIds,
          accessibleActions: response.data.userInfo.accessibleActions,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        router.replace("/(drawer)/home");
      } else {
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

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Pno is required" });
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.put<ForgotPasswordResponse>(
        `${API_ENDPOINTS.AUTH.FORGOT}/${email}`
      );

      setAlert({
        visible: true,
        message: response.data.message,
        type: response.data.status ? "success" : "error",
      });
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

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />
      <View style={styles.formContainer}>
        <CustomInput
          label="Pno"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your Pno"
          error={errors.email}
          keyboardType="number-pad"
        />
        <CustomInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
        />
        <View style={styles.buttonContainer}>
          <CustomButton title="Login" onPress={handleLogin} loading={loading} />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Forgot Password"
            variant="secondary"
            onPress={handleForgotPassword}
            loading={loading}
          />
        </View>
      </View>
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
});
