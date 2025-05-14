import { useAppSelector } from "@/app/store/hooks";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StyleSheet,
  View,
} from "react-native";

const LoadingDots = () => {
  // Create animated values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Animation function
  const animateDots = () => {
    // Reset all dots
    dot1Opacity.setValue(0.3);
    dot2Opacity.setValue(0.3);
    dot3Opacity.setValue(0.3);

    // Sequence of animations
    Animated.sequence([
      // Dot 1 animation
      Animated.timing(dot1Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Dot 2 animation
      Animated.timing(dot2Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Dot 3 animation
      Animated.timing(dot3Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start(() => {
      // Restart animation
      setTimeout(animateDots, 300);
    });
  };

  useEffect(() => {
    animateDots();
    return () => {
      // Clean up animations if needed
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
};

const Loader = () => {
  const loading = useAppSelector((x) => x.loading.loading);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <Modal animationType="fade" transparent={true} visible={loading}>
        <View style={styles.modalContainer}>
          <View style={styles.loaderBox}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <LoadingDots />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    width: 200,
    height: 200,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    marginHorizontal: 6,
  },
});
