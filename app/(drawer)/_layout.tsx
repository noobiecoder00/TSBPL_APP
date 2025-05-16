import { store } from "@/app/store/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Image, TouchableOpacity } from "react-native";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { CustomDrawerContent } from "./CustomDrawerContent"; // Adjust path as needed

export default function DrawerLayout() {
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
              drawerItemStyle: { height: 0 }, // Hide this default item, show via custom drawer
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
              drawerLabel: "TPI Expiry",
              title: "TPI Expiry",
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
              drawerLabel: "TPI Expiry Details",
              title: "TPI Expiry Details",
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
              drawerLabel: "Check List",
              title: "Check List",
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
              drawerLabel: "Check List Details",
              title: "Check List Details",
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
              drawerLabel: "Daily Project Progress Entry",
              title: "Daily Project Progress Entry",
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
              drawerLabel: "Daily Project Progress Entry",
              title: "Daily Project Progress Entry",
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
