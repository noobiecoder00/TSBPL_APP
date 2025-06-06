import { COLORS, FONTS, SIZES } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface UserData {
  name: string;
  pno: string;
  role: string;
  type: string;
  vendorName: string;
  vendorCode: string;
  force: string;
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

  useEffect(() => {
    if (userData?.force === "Y") {
      console.log("userData", userData);
      router.push("/changePwd");
    }
  }, [userData]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/tsbpl_app_icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {userData && (
          <View style={styles.card}>
            {userData.type === "User" && (
              <>
                <Text style={styles.userText}>👤 Name: {userData.name}</Text>
                <Text style={styles.userText}>🆔 PNO: {userData.pno}</Text>
                <Text style={styles.userText}>🎖️ Role: {userData.role}</Text>
              </>
            )}
            {userData.type === "Vendor" && (
              <>
                <Text style={styles.userText}>
                  🏭 Vendor Name: {userData.vendorName}
                </Text>
                <Text style={styles.userText}>
                  🏭 Vendor Code: {userData.vendorCode}
                </Text>
                <Text style={styles.userText}>🏭 Role: {userData.type}</Text>
              </>
            )}
          </View>
        )}
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
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: SIZES.medium,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.primary,
    marginBottom: SIZES.large,
  },
  card: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    padding: SIZES.medium,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SIZES.large,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    marginBottom: SIZES.small,
    color: COLORS.primary,
  },
  userText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: "#333",
    marginBottom: 4,
  },
});
