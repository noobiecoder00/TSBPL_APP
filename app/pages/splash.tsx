import AsyncStorage from "@react-native-async-storage/async-storage";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text } from "react-native";

const { width, height } = Dimensions.get("window");

interface GradientTextProps {
  text: string;
  style: any;
}

const GradientText = ({ text, style }: GradientTextProps) => (
  <MaskedView maskElement={<Text style={[style, { opacity: 1 }]}>{text}</Text>}>
    <LinearGradient
      colors={["#1a237e", "#d32f2f", "#ff9800"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={[style, { opacity: 0 }]}>{text}</Text>
    </LinearGradient>
  </MaskedView>
);

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  console.log("[Splash] Rendering splash screen");

  const fadeOut = () => {
    console.log("[Splash] Starting fade out animation");
    return new Promise<void>((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        console.log("[Splash] Fade out animation completed");
        resolve();
      });
    });
  };

  useEffect(() => {
    let isMounted = true;
    console.log("[Splash] Starting splash screen effect");

    const checkAuth = async () => {
      try {
        console.log("[Splash] Checking authentication");
        const userData = await AsyncStorage.getItem("userData");
        const userDataObj = JSON.parse(userData || "");
        console.log("[Splash] User data exists:", !!userData);

        // Wait for 3 seconds to show splash screen
        console.log("[Splash] Waiting for 3 seconds");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!isMounted) {
          console.log("[Splash] Component unmounted, stopping navigation");
          return;
        }

        // Fade out before navigation
        await fadeOut();
        if (userData) {
          console.log("[Splash] User authenticated, navigating to home");
          console.log("Session : ", userData);
          if (userDataObj.type === "Vendor") {
            router.replace("/(drawer)/Vendor/cwAttendance/cwAttendanceIndex");
          } else {
            router.replace("/(drawer)/home");
          }
        } else {
          console.log("[Splash] No user data, navigating to login");
          router.replace("/pages/login");
        }
      } catch (error) {
        console.log("[Splash] Error during auth check:", error);
        if (isMounted) {
          await fadeOut();
          console.log("[Splash] Error occurred, navigating to login");
          router.replace("/pages/login");
        }
      }
    };

    // Start the auth check immediately
    checkAuth();

    return () => {
      console.log("[Splash] Cleaning up splash screen effect");
      isMounted = false;
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />
      <Image
        source={require("../../assets/images/netra_logo.png")}
        style={styles.mainlogo}
      />
      <GradientText text="#ShelterForAll" style={styles.gradientText} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 60,
  },

  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
  },

  mainlogo: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: "contain",
    marginBottom: 120,
  },

  gradientText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
});
