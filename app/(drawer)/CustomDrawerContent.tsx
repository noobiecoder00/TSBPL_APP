import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const router = useRouter();
  const navigation = useNavigation();
  const [isVendorMenuOpen, setIsVendorMenuOpen] = useState(false);
  const [isSafetyMenuOpen, setIsSafetyMenuOpen] = useState(false);
  const [isConstructionMenuOpen, setIsConstructionMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [accessibleActions, setAccessibleActions] = useState<string[]>([]);

  // Animation values
  const vendorMenuHeight = useRef(new Animated.Value(0)).current;
  const safetyMenuHeight = useRef(new Animated.Value(0)).current;
  const constructionMenuHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setAccessibleActions(userData.accessibleActions || []);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

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

  const ConstructionActions = [
    "DailyProjectProgressEntryForm/Create",
    "DailyProjectProgressEntryForm/Edit",
    "DailyProjectProgressEntryForm/Details",
    "DailyProjectProgressEntryForm/Delete",
    "CustomerBillEntryForm/Create",
    "CustomerBillEntryForm/Edit",
    "CustomerBillEntryForm/Details",
    "CustomerBillEntryForm/Delete",
    "BuilderBillingEntryForm/Create",
    "BuilderBillingEntryForm/Edit",
    "BuilderBillingEntryForm/Details",
    "BuilderBillingEntryForm/Delete",
  ];

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

      {/* Vendor Menu with Toggle - Only show if user has permissions */}
      {(accessibleActions.includes("VendorMaster/Details") ||
        accessibleActions.includes("VendorMaster/Create") ||
        accessibleActions.includes("VendorMaster/Edit") ||
        accessibleActions.includes("VendorMaster/Delete")) && (
        <>
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
              <DrawerItem
                label="CW Attendance"
                onPress={() =>
                  props.navigation.navigate(
                    "Vendor/cwAttendance/cwAttendanceIndex"
                  )
                }
                icon={({ color }) => (
                  <Ionicons name="people-outline" size={20} color={color} />
                )}
                style={getMenuStyle("Vendor/cwAttendance/cwAttendanceIndex")}
              />
            </View>
          </Animated.View>
        </>
      )}

      {(accessibleActions.includes("TPI_Expiry/Index") ||
        accessibleActions.includes("Checklist/Index")) && (
        <>
          {/* Safety Menu with Toggle */}
          <TouchableOpacity onPress={toggleSafetyMenu}>
            <View
              style={[
                { flexDirection: "row", alignItems: "center", padding: 16 },
                getMenuStyle("safety"),
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#333"
              />
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
              {/* @if (accessibleActions.Contains("TPI_Expiry/Index")) */}
              {accessibleActions.includes("TPI_Expiry/Index") && (
                <DrawerItem
                  label="Pending TPI Expiry"
                  onPress={() => props.navigation.navigate("Safety/tpiExpiry")}
                  icon={({ color }) => (
                    <Ionicons name="time-outline" size={20} color={color} />
                  )}
                  style={getMenuStyle("Safety/tpiExpiry")}
                />
              )}
              {/* @if (accessibleActions.Contains("Checklist/Index")) */}
              {accessibleActions.includes("Checklist/Index") && (
                <DrawerItem
                  label="Pending Check List"
                  onPress={() => props.navigation.navigate("Safety/checklist")}
                  icon={({ color }) => (
                    <Ionicons name="list-outline" size={20} color={color} />
                  )}
                  style={getMenuStyle("Safety/checklist")}
                />
              )}
            </View>
          </Animated.View>
        </>
      )}

      {ConstructionActions.some((action) =>
        accessibleActions.includes(action)
      ) && (
        <>
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
              {(accessibleActions.includes(
                "DailyProjectProgressEntryForm/Create"
              ) ||
                accessibleActions.includes(
                  "DailyProjectProgressEntryForm/Edit"
                ) ||
                accessibleActions.includes(
                  "DailyProjectProgressEntryForm/Details"
                ) ||
                accessibleActions.includes(
                  "DailyProjectProgressEntryForm/Delete"
                )) && (
                <DrawerItem
                  label="Daily Project Progress Entry"
                  onPress={() =>
                    props.navigation.navigate(
                      "Construction/DailyProjectProgressEntry/DailyProjectIndex"
                    )
                  }
                  icon={({ color }) => (
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={color}
                    />
                  )}
                  style={getMenuStyle(
                    "Construction/DailyProjectProgressEntry/DailyProjectIndex"
                  )}
                />
              )}

              {(accessibleActions.includes("CustomerBillEntryForm/Create") ||
                accessibleActions.includes("CustomerBillEntryForm/Edit") ||
                accessibleActions.includes("CustomerBillEntryForm/Details") ||
                accessibleActions.includes("CustomerBillEntryForm/Delete")) && (
                <DrawerItem
                  label="Customer Bill Entry"
                  onPress={() =>
                    props.navigation.navigate(
                      "Construction/CustomerBilling/CustomerBillingIndex"
                    )
                  }
                  icon={({ color }) => (
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={color}
                    />
                  )}
                  style={getMenuStyle(
                    "Construction/CustomerBilling/CustomerBillingIndex"
                  )}
                />
              )}

              {(accessibleActions.includes("BuilderBillingEntryForm/Create") ||
                accessibleActions.includes("BuilderBillingEntryForm/Edit") ||
                accessibleActions.includes("BuilderBillingEntryForm/Details") ||
                accessibleActions.includes(
                  "BuilderBillingEntryForm/Delete"
                )) && (
                <DrawerItem
                  label="Builder Bill Entry"
                  onPress={() =>
                    props.navigation.navigate(
                      "Construction/BuilderBilling/BuilderBillingIndex"
                    )
                  }
                  icon={({ color }) => (
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={color}
                    />
                  )}
                  style={getMenuStyle(
                    "Construction/BuilderBilling/BuilderBillingIndex"
                  )}
                />
              )}
            </View>
          </Animated.View>
        </>
      )}

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
