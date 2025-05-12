import { COLORS, FONTS, SIZES } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Safety() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety</Text>
      {/* Add your safety content here */}
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
