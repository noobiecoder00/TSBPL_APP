import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CustomDrawerContent } from "./CustomDrawerContent"; // Adjust path as needed

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          }}
        />
        <Drawer.Screen
          name="Vendor/index"
          options={{
            drawerLabel: "Contractor Worker Master",
            title: "Contractor Worker Master",
            drawerItemStyle: { height: 0 }, // Hide this default item, show via custom drawer
          }}
        />
        <Drawer.Screen
          name="Vendor/CWCreateForm"
          options={{
            drawerLabel: "CW Create Form",
            title: "CW Create Form",
            drawerItemStyle: { height: 0 }, // Hide this too, custom nested render
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
          }}
        />
      </Drawer>
      <FlashMessage position="bottom" />
    </GestureHandlerRootView>
  );
}
