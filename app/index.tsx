import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Ensure this runs first
    const redirectToSplash = () => {
      router.replace("/pages/splash");
    };

    // Immediate execution
    redirectToSplash();
  }, []);

  return <View />;
}
