import { CustomButton } from "@/components/CustomButton";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserData {
  name: string;
  pno: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      router.replace("/pages/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleCreateCW = () => {
    // Navigate to Create CW page
    router.push("/(drawer)/Vendor/CWCreateForm");
  };

  const handleViewCW = () => {
    // Navigate to View CW page
    router.push("/pages/view-cw" as any);
  };

  const handleSafety = () => {
    // Navigate to Safety page
    router.push("/pages/safety" as any);
  };

  const handleConstruction = () => {
    // Navigate to Construction page
    router.push("/pages/construction" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to TBSPL</Text>
        {userData && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>Name: {userData.name}</Text>
            <Text style={styles.userText}>PNO: {userData.pno}</Text>
            <Text style={styles.userText}>Role: {userData.role}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="CW Create"
          onPress={handleCreateCW}
          variant="primary"
        />
        <CustomButton
          title="CW View"
          onPress={handleViewCW}
          variant="primary"
        />
        <CustomButton title="Safety" onPress={handleSafety} variant="primary" />
        <CustomButton title="Safety" onPress={handleSafety} variant="primary" />
        <CustomButton
          title="Construction"
          onPress={handleConstruction}
          variant="primary"
        />
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.large,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  userInfo: {
    marginTop: SIZES.small,
  },
  userText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  buttonContainer: {
    flex: 1,
    padding: SIZES.large,
    justifyContent: "center",
    gap: SIZES.medium,
  },
});
