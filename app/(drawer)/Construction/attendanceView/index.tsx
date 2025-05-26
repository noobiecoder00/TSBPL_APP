import { COLORS } from "@/constants/theme"; // Adjust p
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import All from "./All";
import Pending from "./Pending";

const renderScene = SceneMap({
  first: All,
  second: Pending,
});

const routes = [
  { key: "first", title: "All" },
  { key: "second", title: "Pending With Me" },
];

const AttendanceView = () => {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default AttendanceView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text || "#333",
    marginBottom: 10,
  },
  createButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary || "#4A90E2",
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
