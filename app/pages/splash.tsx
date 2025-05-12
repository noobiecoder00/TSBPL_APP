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

  const fadeOut = () => {
    return new Promise<void>((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");

        // Wait for 3 seconds to show splash screen
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!isMounted) return;

        // Fade out before navigation
        await fadeOut();
        if (userData) {
          router.replace("/pages/home");
        } else {
          router.replace("/pages/login");
        }
      } catch (error) {
        if (isMounted) {
          await fadeOut();
          router.replace("/pages/login");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />
      <GradientText text="#ShelterForAll" style={styles.gradientText} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
    marginBottom: 20,
  },

  gradientText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
});
