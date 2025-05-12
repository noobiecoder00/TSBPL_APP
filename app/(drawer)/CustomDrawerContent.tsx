import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerNavigationProp,
} from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DrawerParamList = {
  home: undefined;
  "contractor-worker-master": undefined;
  "contractor-worker-master/CWCreateForm": undefined;
  safety: undefined;
  construction: undefined;
};

type NavigationProp = DrawerNavigationProp<DrawerParamList>;

export default function CustomDrawerContent(props: any) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <DrawerContentScrollView {...props}>
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("home")}
      >
        <Ionicons name="grid-outline" size={20} color="#333" />
        <Text style={styles.label}>Dashboard</Text>
      </Pressable>

      {/* Contractor Worker Master Group */}
      <View style={styles.group}>
        <Text style={styles.groupTitle}>Contractor Worker Master</Text>
        <Pressable
          style={styles.subItem}
          onPress={() =>
            navigation.navigate("contractor-worker-master/CWCreateForm")
          }
        >
          <Ionicons name="create-outline" size={18} color="#333" />
          <Text style={styles.label}>CW Create Form</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("safety")}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color="#333" />
        <Text style={styles.label}>Safety</Text>
      </Pressable>

      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("construction")}
      >
        <Ionicons name="construct-outline" size={20} color="#333" />
        <Text style={styles.label}>Construction</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  group: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4A90E2",
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 8,
  },
});
