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
    dispatch(showLoading());
    const loadUserData = async () => {
      dispatch(showLoading());
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
        dispatch(hideLoading());
      } catch (error) {
        console.error("Error loading user data:", error);
        dispatch(hideLoading());
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (userData?.force === "Y") {
      router.push("/changePwd");
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.id) {
      // console.log("userData", userData.type);
      const encodedUserId = Buffer.from(
        userData.id.toString(),
        "utf-8"
      ).toString("base64");
      const url = `${baseURL}/Dashboard/MobileView?UserId=${encodedUserId}&token=${userData.token}`;
      console.log("Dashboard URL:", url);
      setWebUrl(url);
    }
  }, [userData?.id]);

  return (
    <View style={styles.container}>
      {webUrl && userData?.type !== "Vendor" ? (
        <WebView
          source={{ uri: webUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      ) : (
        <View></View>
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
