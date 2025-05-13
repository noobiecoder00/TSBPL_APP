import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[Layout] Starting auth check");
        const userData = await AsyncStorage.getItem("userData");
        const currentRoute = segments.join("/");
        console.log("[Layout] Current route:", currentRoute);
        console.log("[Layout] User data exists:", !!userData);

        // For initial route and splash, just set ready
        if (!currentRoute || currentRoute === "pages/splash") {
          setIsReady(true);
          return;
        }

        // For other routes, handle authentication
        if (!userData && !currentRoute.includes("login")) {
          console.log("[Layout] No user data, redirecting to login");
          router.replace("/pages/login");
        } else if (userData && currentRoute.includes("login")) {
          console.log("[Layout] User authenticated, redirecting to home");
          router.replace("/(drawer)/home");
        }
      } catch (error) {
        console.log("[Layout] Auth check error:", error);
        router.replace("/pages/login");
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, [segments]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="pages/login" />
      <Stack.Screen name="pages/splash" />
      <Stack.Screen name="pages/changePwd" />
    </Stack>
  );
}
