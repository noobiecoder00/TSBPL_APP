import { COLORS } from "@/constants/theme";
import { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../store/loaderSlice";

interface UserData {
  id: number;
  name: string;
  pno: string;
  role: string;
  type: string;
  vendorName: string;
  vendorCode: string;
  force: string;
  token: string | null;
}

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [webUrl, setWebUrl] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserData = async () => {
      dispatch(showLoading());
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const parsedData: UserData = JSON.parse(userDataString);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        dispatch(hideLoading());
      }
    };

    loadUserData();
  }, []);

  // Redirect if force = Y
  useEffect(() => {
    if (userData?.force === "Y") {
      router.replace("/changePwd");
    }
  }, [userData?.force]);

  // Redirect vendors to attendance
  useEffect(() => {
    if (userData?.type === "Vendor") {
      console.log("Redirecting to Take Attendace!");
      router.replace("/Vendor/cwAttendance/cwAttendanceIndex");
    }
  }, [userData?.type]);

  // Set dashboard URL if non-vendor
  useEffect(() => {
    if (userData?.id && userData?.type !== "Vendor") {
      const encodedUserId = Buffer.from(
        userData.id.toString(),
        "utf-8"
      ).toString("base64");
      const url = `${baseURL}/Dashboard/MobileView?UserId=${encodedUserId}&token=${userData.token}`;
      console.log("Dashboard URL:", url);
      setWebUrl(url);
    }
  }, [userData?.id, userData?.type]);

  return (
    <View style={styles.container}>
      {webUrl && userData?.type !== "Vendor" && (
        <WebView
          source={{ uri: webUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      )}
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
