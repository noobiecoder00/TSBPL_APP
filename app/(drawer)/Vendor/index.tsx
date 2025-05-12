import { useNavigation } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../../constants/theme"; // Adjust path to your theme if different

const ContractorWorkerMaster = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contractor Worker Master</Text>

      <Button
        title="Go to CW Create Form"
        onPress={() => navigation.navigate("CWCreateForm" as never)}
        color={COLORS.primary || "#4A90E2"}
      />
    </View>
  );
};

export default ContractorWorkerMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text || "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: COLORS.text || "#666",
    marginBottom: 20,
  },
});
