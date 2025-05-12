import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import FlashMessage from "react-native-flash-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
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
          name="CWCreateForm"
          options={{
            drawerLabel: "CW Create Form",
            title: "CW Create Form",
            drawerIcon: ({ color }) => (
              <Ionicons name="create-outline" size={24} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="contractor-worker-master"
          options={{
            drawerLabel: "Contractor Worker Master",
            title: "Contractor Worker Master",
            drawerIcon: ({ color }) => (
              <Ionicons name="people-outline" size={24} color={color} />
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
