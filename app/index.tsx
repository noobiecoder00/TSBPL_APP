import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    console.log("[Index] App started - Redirecting to splash screen");
    // Use setTimeout to ensure the component renders first
    setTimeout(() => {
      router.push("/pages/splash");
    }, 0);
  }, []);

  return <View />;
}
