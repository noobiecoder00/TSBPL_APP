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
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserData {
  name: string;
  role: string;
  type: string;
  vendorName: string;
  vendorCode: string;
}

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
  const [userData, setUserData] = useState<UserData | null>(null);
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
          setUserData(userData);
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
      <View style={styles.userSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={28} color="#FFFFFF" />
        </View>
        <View style={styles.userInfoContainer}>
          {userData?.type === "User" && (
            <>
              <Text style={styles.userName}>{userData?.name}</Text>
              <Text style={styles.userRole}>{userData?.role}</Text>
            </>
          )}
          {userData?.type === "Vendor" && (
            <>
              <Text style={styles.userName}>{userData?.vendorName}</Text>
              <Text style={styles.userRole}>{userData?.vendorCode}</Text>
            </>
          )}
        </View>
      </View>
      {userData?.type === "User" && (
        <>
          <DrawerItem
            label="Dashboard"
            onPress={() => props.navigation.navigate("home")}
            icon={({ color }) => (
              <Ionicons name="grid-outline" size={24} color={color} />
            )}
            style={getMenuStyle("home")}
          />
        </>
      )}

      {/* accessibleActions.includes("VendorMaster/Details") ||
        accessibleActions.includes("VendorMaster/Create") ||
        accessibleActions.includes("VendorMaster/Edit") ||
        accessibleActions.includes("VendorMaster/Delete") ||
         */}
      {/* Vendor Menu with Toggle */}
      {userData?.type === "Vendor" && (
        <>
          <TouchableOpacity onPress={toggleVendorMenu}>
            <View style={[styles.menuItem, getMenuStyle("Vendor")]}>
              <Ionicons name="briefcase-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Vendor</Text>
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
            <View style={styles.nestedMenuContainer}>
              {/* <DrawerItem
                label="Contractor Worker"
                onPress={() => props.navigation.navigate("Vendor/index")}
                icon={({ color }) => (
                  <Ionicons name="people-outline" size={20} color={color} />
                )}
                style={getMenuStyle("Vendor/index")}
              /> */}
              <DrawerItem
                label="Take Attendance"
                onPress={() =>
                  props.navigation.navigate(
                    "Vendor/cwAttendance/cwAttendanceIndex"
                  )
                }
                icon={({ color }) => (
                  <Ionicons name="time-outline" size={20} color={color} />
                )}
                style={getMenuStyle("Vendor/cwAttendance/cwAttendanceIndex")}
              />
              <DrawerItem
                label="View Attendance"
                onPress={() =>
                  props.navigation.navigate(
                    "Vendor/cwAttendance/viewAttendance"
                  )
                }
                icon={({ color }) => (
                  <Ionicons name="eye-outline" size={20} color={color} />
                )}
                style={getMenuStyle("Vendor/cwAttendance/viewAttendance")}
              />
            </View>
          </Animated.View>
        </>
      )}

      {/* Safety Menu with Toggle */}
      {(accessibleActions.includes("TPI_Expiry/Index") ||
        accessibleActions.includes("Checklist/Index") ||
        userData?.type === "Vendor") && (
        <>
          <TouchableOpacity onPress={toggleSafetyMenu}>
            <View style={[styles.menuItem, getMenuStyle("safety")]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#333"
              />
              <Text style={styles.menuText}>Safety</Text>
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
            <View style={styles.nestedMenuContainer}>
              {/* <DrawerItem
                label="Equipment"
                onPress={() =>
                  props.navigation.navigate("Safety/Equipment/equipmentVendor")
                }
                icon={({ color }) => (
                  <Ionicons name="settings" size={20} color={color} />
                )}
                style={getMenuStyle("Safety/Equipment/equipmentVendor")}
              /> */}
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
        </>
      )}

      {/* Construction Menu with Toggle */}
      {ConstructionActions.some((action) =>
        accessibleActions.includes(action)
      ) && (
        <>
          <TouchableOpacity onPress={toggleConstructionMenu}>
            <View style={[styles.menuItem, getMenuStyle("construction")]}>
              <Ionicons name="construct-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Construction</Text>
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
            <View style={styles.nestedMenuContainer}>
              <DrawerItem
                label="View Attendance"
                onPress={() =>
                  props.navigation.navigate("Construction/attendanceView/index")
                }
                icon={({ color }) => (
                  <Ionicons name="eye-outline" size={20} color={color} />
                )}
                style={getMenuStyle("Construction/attendanceView/index")}
              />
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

      <View style={{ marginTop: 10 }}>
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
            AsyncStorage.clear();
            router.replace("/pages/login");
          }}
          icon={({ color }) => (
            <Ionicons name="log-out-outline" size={24} color={color} />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  userSection: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  nestedMenuContainer: {
    paddingLeft: 20,
  },
  activeMenuStyle: {
    backgroundColor: "#e6f3ff",
    borderRadius: 8,
  },
});
