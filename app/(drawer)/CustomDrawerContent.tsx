import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const [isVendorMenuOpen, setIsVendorMenuOpen] = useState(false);

  const toggleVendorMenu = () => setIsVendorMenuOpen((prev) => !prev);
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Dashboard"
        onPress={() => props.navigation.navigate("home")}
        icon={({ color }) => (
          <Ionicons name="grid-outline" size={24} color={color} />
        )}
      />

      {/* Vendor Menu with Toggle */}
      <TouchableOpacity onPress={toggleVendorMenu}>
        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
        >
          <Ionicons name="briefcase-outline" size={24} color="#333" />
          <Text style={{ marginLeft: 16, fontSize: 16, color: "#333" }}>
            Vendor
          </Text>
          <Ionicons
            name={isVendorMenuOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
            style={{ marginLeft: "auto" }}
          />
        </View>
      </TouchableOpacity>

      {/* Nested Vendor Items */}
      {isVendorMenuOpen && (
        <View style={{ paddingLeft: 20 }}>
          <DrawerItem
            label="Contractor Worker Master"
            onPress={() => props.navigation.navigate("Vendor/index")}
            icon={({ color }) => (
              <Ionicons name="people-outline" size={20} color={color} />
            )}
          />
        </View>
      )}

      <DrawerItem
        label="CW Create Form"
        onPress={() => props.navigation.navigate("Vendor/CWCreateForm")}
        icon={({ color }) => (
          <Ionicons name="create-outline" size={20} color={color} />
        )}
      />
      <DrawerItem
        label="Safety"
        onPress={() => props.navigation.navigate("safety")}
        icon={({ color }) => (
          <Ionicons name="shield-checkmark-outline" size={24} color={color} />
        )}
      />

      <DrawerItem
        label="Construction"
        onPress={() => props.navigation.navigate("construction")}
        icon={({ color }) => (
          <Ionicons name="construct-outline" size={24} color={color} />
        )}
      />
    </DrawerContentScrollView>
  );
};
