import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const [isVendorMenuOpen, setIsVendorMenuOpen] = useState(false);
  const [isSafetyMenuOpen, setIsSafetyMenuOpen] = useState(false);
  const [isConstructionMenuOpen, setIsConstructionMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  // Animation values
  const vendorMenuHeight = useRef(new Animated.Value(0)).current;
  const safetyMenuHeight = useRef(new Animated.Value(0)).current;
  const constructionMenuHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentRoute = props.state.routes[props.state.index].name;
    setActiveRoute(currentRoute);

    if (currentRoute.startsWith("Vendor")) {
      animateMenu(vendorMenuHeight, true);
    } else if (currentRoute.startsWith("safety")) {
      animateMenu(safetyMenuHeight, true);
    } else if (currentRoute.startsWith("construction")) {
      animateMenu(constructionMenuHeight, true);
    }
  }, [props.state.routes[props.state.index].name]);

  const animateMenu = (animatedValue: Animated.Value, toValue: boolean) => {
    Animated.timing(animatedValue, {
      toValue: toValue ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const closeAllMenus = () => {
    setIsVendorMenuOpen(false);
    setIsSafetyMenuOpen(false);
    setIsConstructionMenuOpen(false);
    animateMenu(vendorMenuHeight, false);
    animateMenu(safetyMenuHeight, false);
    animateMenu(constructionMenuHeight, false);
  };

  const toggleVendorMenu = () => {
    if (isVendorMenuOpen) {
      closeAllMenus();
    } else {
      closeAllMenus();
      setIsVendorMenuOpen(true);
      animateMenu(vendorMenuHeight, true);
    }
  };

  const toggleSafetyMenu = () => {
    if (isSafetyMenuOpen) {
      closeAllMenus();
    } else {
      closeAllMenus();
      setIsSafetyMenuOpen(true);
      animateMenu(safetyMenuHeight, true);
    }
  };

  const toggleConstructionMenu = () => {
    if (isConstructionMenuOpen) {
      closeAllMenus();
    } else {
      closeAllMenus();
      setIsConstructionMenuOpen(true);
      animateMenu(constructionMenuHeight, true);
    }
  };

  const getMenuStyle = (routeName: string) => {
    return {
      backgroundColor: activeRoute === routeName ? "#e6f3ff" : "transparent",
      borderRadius: 8,
    };
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Dashboard"
        onPress={() => props.navigation.navigate("home")}
        icon={({ color }) => (
          <Ionicons name="grid-outline" size={24} color={color} />
        )}
        style={getMenuStyle("home")}
      />

      {/* Vendor Menu with Toggle */}
      <TouchableOpacity onPress={toggleVendorMenu}>
        <View
          style={[
            { flexDirection: "row", alignItems: "center", padding: 16 },
            getMenuStyle("Vendor"),
          ]}
        >
          <Ionicons name="briefcase-outline" size={24} color="#333" />
          <Text style={{ marginLeft: 16, fontSize: 16, color: "#333" }}>
            Vendor
          </Text>
          <Animated.View
            style={{
              marginLeft: "auto",
              transform: [
                {
                  rotate: vendorMenuHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Nested Vendor Items */}
      <Animated.View
        style={{
          maxHeight: vendorMenuHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          }),
          opacity: vendorMenuHeight,
          overflow: "hidden",
        }}
      >
        <View style={{ paddingLeft: 20 }}>
          <DrawerItem
            label="Contractor Worker"
            onPress={() => props.navigation.navigate("Vendor/index")}
            icon={({ color }) => (
              <Ionicons name="people-outline" size={20} color={color} />
            )}
            style={getMenuStyle("Vendor/index")}
          />
        </View>
      </Animated.View>

      {/* Safety Menu with Toggle */}
      <TouchableOpacity onPress={toggleSafetyMenu}>
        <View
          style={[
            { flexDirection: "row", alignItems: "center", padding: 16 },
            getMenuStyle("safety"),
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
          <Text style={{ marginLeft: 16, fontSize: 16, color: "#333" }}>
            Safety
          </Text>
          <Animated.View
            style={{
              marginLeft: "auto",
              transform: [
                {
                  rotate: safetyMenuHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Nested Safety Items */}
      <Animated.View
        style={{
          maxHeight: safetyMenuHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 150],
          }),
          opacity: safetyMenuHeight,
          overflow: "hidden",
        }}
      >
        <View style={{ paddingLeft: 20 }}>
          <DrawerItem
            label="Pending TPI Expiry"
            onPress={() => props.navigation.navigate("Safety/tpiExpiry")}
            icon={({ color }) => (
              <Ionicons name="time-outline" size={20} color={color} />
            )}
            style={getMenuStyle("Safety/tpiExpiry")}
          />
          <DrawerItem
            label="Pending Check List"
            onPress={() => props.navigation.navigate("Safety/checklist")}
            icon={({ color }) => (
              <Ionicons name="list-outline" size={20} color={color} />
            )}
            style={getMenuStyle("Safety/checklist")}
          />
        </View>
      </Animated.View>

      {/* Construction Menu with Toggle */}
      <TouchableOpacity onPress={toggleConstructionMenu}>
        <View
          style={[
            { flexDirection: "row", alignItems: "center", padding: 16 },
            getMenuStyle("construction"),
          ]}
        >
          <Ionicons name="construct-outline" size={24} color="#333" />
          <Text style={{ marginLeft: 16, fontSize: 16, color: "#333" }}>
            Construction
          </Text>
          <Animated.View
            style={{
              marginLeft: "auto",
              transform: [
                {
                  rotate: constructionMenuHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Nested Construction Items */}
      <Animated.View
        style={{
          maxHeight: constructionMenuHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          opacity: constructionMenuHeight,
          overflow: "hidden",
        }}
      >
        <View style={{ paddingLeft: 20 }}>
          <DrawerItem
            label="Daily Project Progress Entry"
            onPress={() =>
              props.navigation.navigate(
                "Construction/DailyProjectProgressEntry/DailyProjectIndex"
              )
            }
            icon={({ color }) => (
              <Ionicons name="document-text-outline" size={20} color={color} />
            )}
            style={getMenuStyle(
              "Construction/DailyProjectProgressEntry/DailyProjectIndex"
            )}
          />
          <DrawerItem
            label="Customer Bill Entry"
            onPress={() =>
              props.navigation.navigate(
                "Construction/CustomerBilling/CustomerBillingIndex"
              )
            }
            icon={({ color }) => (
              <Ionicons name="document-text-outline" size={20} color={color} />
            )}
            style={getMenuStyle(
              "Construction/CustomerBilling/CustomerBillingIndex"
            )}
          />
          <DrawerItem
            label="Builder Bill Entry"
            onPress={() =>
              props.navigation.navigate(
                "Construction/BuilderBilling/BuilderBillingIndex"
              )
            }
            icon={({ color }) => (
              <Ionicons name="document-text-outline" size={20} color={color} />
            )}
            style={getMenuStyle(
              "Construction/BuilderBilling/BuilderBillingIndex"
            )}
          />
        </View>
      </Animated.View>
      <DrawerItem
        label="Change Password"
        onPress={() => props.navigation.navigate("changePwd")}
        icon={({ color }) => (
          <Ionicons name="lock-closed-outline" size={24} color={color} />
        )}
        style={getMenuStyle("changePwd")}
      />
      <DrawerItem
        label="Logout"
        onPress={() => {
          // Clear any stored data if needed
          AsyncStorage.clear();
          router.replace("/pages/login");
        }}
        icon={({ color }) => (
          <Ionicons name="log-out-outline" size={24} color={color} />
        )}
      />
    </DrawerContentScrollView>
  );
};
