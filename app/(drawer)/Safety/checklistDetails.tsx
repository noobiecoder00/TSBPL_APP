import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { COLORS } from "@/constants/theme";
import { baseURL } from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import { useDispatch } from "react-redux";

interface UserData {
  id: string;
  token: string;
  type: string;
}

export default function ChecklistDetails() {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [webUrl, setWebUrl] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0); // 🔁 Forcing reload

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

  const buildUrl = (user: UserData) => {
    const encodedUserId = Buffer.from(user.id.toString(), "utf-8").toString(
      "base64"
    );
    const userType = user.type === "User" ? "user" : "vendor";
    return `${baseURL}/CategoryCheckList/MobileView/${id}?token=${user.token}&UserId=${encodedUserId}&UserType=${userType}&tpi=0`;
  };

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        try {
          dispatch(showLoading());
          await loadUserData();
          setWebViewKey((prev) => prev + 1); // 🔄 Force reload on focus
        } catch (error) {
          console.error("Error initializing:", error);
        } finally {
          dispatch(hideLoading());
        }
      };

      initialize();
    }, [id])
  );

  useEffect(() => {
    if (userData?.id && id) {
      setWebUrl(buildUrl(userData));
    }
  }, [userData?.id, id]);

  return (
    <View style={styles.container}>
      {webUrl ? (
        <WebView
          key={webViewKey}
          source={{ uri: webUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      ) : null}
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
