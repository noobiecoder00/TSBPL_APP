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
