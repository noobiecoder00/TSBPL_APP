import { store } from "@/app/store/store";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { CustomDrawerContent } from "./CustomDrawerContent"; // Adjust path as needed

interface UserData {
  id: string;
  accessibleActions: string[];
}

export default function DrawerLayout() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [accessibleActions, setAccessibleActions] = useState<string[]>([]);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
        console.log("userData : ", userData);
      }
      setAccessibleActions(userData?.accessibleActions || []);
      console.log("Accessible Actions : ", accessibleActions);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: {
              backgroundColor: "#4A90E2",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            drawerActiveTintColor: "#4A90E2",
            drawerInactiveTintColor: "#333",
            drawerStyle: {
              backgroundColor: "#fff",
              width: 300,
            },
            drawerType: "front",
            swipeEnabled: true,
            headerShown: true,
          }}
        >
          <Drawer.Screen
            name="home"
            options={{
              drawerLabel: "Dashboard",
              title: "Dashboard",
              drawerIcon: ({ color }) => (
                <Ionicons name="grid-outline" size={24} color={color} />
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Vendor/index"
            options={{
              drawerLabel: "Contractor Worker",
              title: "Contractor Worker",
              drawerItemStyle: { height: 0 },
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Vendor/CWCreateForm"
            options={{
              drawerLabel: "CW Create Form",
              title: "CW Create Form",
              drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/Vendor")}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Vendor/cwAttendance/cwAttendanceIndex"
            options={{
              drawerLabel: "CW Attendance",
              title: "CW Attendance",
              drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/home")}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Vendor/CWDetails"
            options={{
              drawerLabel: "CW Details",
              title: "CW Details",
              drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/Vendor")}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="safety"
            options={{
              drawerLabel: "Safety",
              title: "Safety",
              drawerIcon: ({ color }) => (
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={color}
                />
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Safety/tpiExpiry"
            options={{
              drawerLabel: "Pending TPI Expiry",
              title: "Pending TPI Expiry",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Safety/tpiDetails"
            options={{
              drawerLabel: "Equipment Details",
              title: "Equipment Details",
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/Safety/tpiExpiry")}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Safety/checklist"
            options={{
              drawerLabel: "Pending Check List",
              title: "Pending Check List",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Safety/checklistDetails"
            options={{
              drawerLabel: "Equipment Details",
              title: "Equipment Details",
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/Safety/checklist")}
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="construction"
            options={{
              drawerLabel: "Construction",
              title: "Construction",
              drawerIcon: ({ color }) => (
                <Ionicons name="construct-outline" size={24} color={color} />
              ),
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Construction/DailyProjectProgressEntry/DailyProjectIndex"
            options={{
              drawerLabel: "DPR Entry",
              title: "DPR Entry",
              drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/DailyProjectProgressEntry/dailyProjectCreateForm"
            options={{
              drawerLabel: "DPR Entry",
              title: "DPR Entry",
              drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/DailyProjectProgressEntry/dailyProjectDetails"
            options={{
              drawerLabel: "DPR Details",
              title: "DPR Details",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() =>
                    router.push(
                      "/Construction/DailyProjectProgressEntry/DailyProjectIndex"
                    )
                  }
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/CustomerBilling/CustomerBillingIndex"
            options={{
              drawerLabel: "Customer Bill Entry",
              title: "Customer Bill Entry",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Construction/CustomerBilling/customerBillingCreateForm"
            options={{
              drawerLabel: "Customer Bill Entry",
              title: "Customer Bill Entry",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/CustomerBilling/customerBillingDetails"
            options={{
              drawerLabel: "Customer Bill Details",
              title: "Customer Bill Details",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() =>
                    router.push(
                      "/Construction/CustomerBilling/CustomerBillingIndex"
                    )
                  }
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/BuilderBilling/BuilderBillingIndex"
            options={{
              drawerLabel: "Builder Bill Entry",
              title: "Builder Bill Entry",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Construction/BuilderBilling/builderBillingCreateForm"
            options={{
              drawerLabel: "Builder Bill Entry",
              title: "Builder Bill Entry",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
            }}
          />

          <Drawer.Screen
            name="Construction/BuilderBilling/builderBillingDetails"
            options={{
              drawerLabel: "Builder Bill Details",
              title: "Builder Bill Details",
              headerRight: () => (
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                  resizeMode="contain"
                  tintColor="#fff"
                />
              ),
              headerLeft: () => (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() =>
                    router.push(
                      "/Construction/BuilderBilling/BuilderBillingIndex"
                    )
                  }
                >
                  <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            }}
          />
        </Drawer>

        <Drawer.Screen
          name="changePwd"
          options={{
            drawerLabel: "Change Password",
            title: "Change Password",
            drawerIcon: ({ color }) => (
              <Ionicons name="lock-closed-outline" size={24} color={color} />
            ),
            headerRight: () => (
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 100, height: 100, marginRight: 10 }}
                resizeMode="contain"
                tintColor="#fff"
              />
            ),
          }}
        />
        <FlashMessage position="bottom" />
      </Provider>
    </GestureHandlerRootView>
  );
}
