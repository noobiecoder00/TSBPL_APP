import { COLORS, FONTS, SIZES } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Construction() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Construction</Text>
      {/* Add your construction content here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.large,
    backgroundColor: COLORS.background,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xlarge,
    color: COLORS.primary,
    marginBottom: SIZES.large,
  },
});
