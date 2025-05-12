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
        const userData = await AsyncStorage.getItem("userData");
        const currentRoute = segments.join("/");

        // For initial route (index), let it handle its own navigation
        if (!currentRoute) {
          setIsReady(true);
          return;
        }

        // Skip auth check for splash screen
        if (currentRoute.includes("splash")) {
          setIsReady(true);
          return;
        }

        // For other routes, handle authentication
        if (!userData && !currentRoute.includes("login")) {
          router.replace("/pages/login");
        } else if (userData && currentRoute.includes("login")) {
          router.replace("/(drawer)/home");
        }
      } catch (error) {
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
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="pages/login" />
      <Stack.Screen name="pages/splash" />
    </Stack>
  );
}
