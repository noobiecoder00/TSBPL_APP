import { COLORS } from "@/constants/theme";
import { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

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
  const dashboardUrl = `${baseURL}/Dashboard/MobileView`;
  console.log("Loading dashboard URL:", dashboardUrl);
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
      <WebView
        source={{ uri: dashboardUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
