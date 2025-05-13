import Loader from "@/components/Loader";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

interface UserData {
  name: string;
  pno: string;
  role: string;
}

const ChangePassword = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number.");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    try {
      // Dummy API call - replace with your actual API endpoint
      const response = await axios.post(
        "https://api.example.com/change-password",
        {
          oldPassword,
          newPassword,
          userId: userData?.pno,
        }
      );

      if (response.data.success) {
        // Handle successful password change
        alert("Password changed successfully");
        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred while changing password");
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    loadUserData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Change Password",
          headerStyle: {
            backgroundColor: "#4A90E2",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => (
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 100, height: 100, marginRight: 10 }}
              resizeMode="contain"
              tintColor="#fff"
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.splashContainer}>
          <MaterialIcons name="lock-reset" style={styles.icon} />
          <Text style={styles.instruction}>
            Your new password must be different from previously used passwords.
          </Text>

          <TextInput
            mode="outlined"
            label="Old Password"
            secureTextEntry
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TextInput
            mode="outlined"
            label="New Password"
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            error={!!error}
          />
          <TextInput
            mode="outlined"
            label="Confirm Password"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={!!error}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.passwordRules}>
            <RuleItem
              text="At least 8 characters"
              condition={newPassword.length >= 8}
            />
            <RuleItem
              text="At least 1 number"
              condition={/\d/.test(newPassword)}
            />
            <RuleItem
              text="At least 1 uppercase letter"
              condition={/[A-Z]/.test(newPassword)}
            />
            <RuleItem
              text="At least 1 lowercase letter"
              condition={/[a-z]/.test(newPassword)}
            />
            <RuleItem
              text="At least 1 special character"
              condition={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)}
            />
          </View>

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleChangePassword}
          >
            Change Password
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

// Helper Component for Password Rules
const RuleItem = ({
  text,
  condition,
}: {
  text: string;
  condition: boolean;
}) => {
  return (
    <View style={styles.ruleContainer}>
      <Octicons
        name={condition ? "check" : "circle-slash"}
        size={16}
        color={condition ? "green" : "red"}
      />
      <Text
        style={[styles.passwordRule, { color: condition ? "green" : "red" }]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    textAlign: "center",
    color: "red",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    marginBottom: 12,
  },
  icon: {
    marginBottom: 8,
    fontSize: 100,
    color: "silver",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  passwordRules: {
    width: "100%",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    elevation: 4,
  },
  ruleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  passwordRule: {
    fontSize: 14,
    marginLeft: 6,
  },
  button: {
    width: "100%",
    marginTop: 16,
    paddingVertical: 12,
  },
  splashImage: {
    position: "absolute",
    width: 150,
    height: 150,
    opacity: 0.5,
  },
  blueSplash: {
    top: 0,
    left: 0,
  },
  redSplash: {
    bottom: 0,
    right: 0,
  },
});

export default ChangePassword;
