import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { COLORS } from "../../../../constants/theme";
import builderBillingAll from "./builderBillingAll";
import builderBillingPending from "./builderBillingPending";

const renderScene = SceneMap({
  first: builderBillingAll,
  second: builderBillingPending,
});

const routes = [
  { key: "first", title: "All" },
  { key: "second", title: "Pending With Me" },
];

const BuilderBillingIndex = () => {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          router.navigate(
            "/Construction/BuilderBilling/builderBillingCreateForm"
          )
        }
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create New</Text>
      </TouchableOpacity>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default BuilderBillingIndex;

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
