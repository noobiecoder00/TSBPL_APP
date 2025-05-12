import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "./CustomButton";

interface CustomAlertProps {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  message,
  type,
  onClose,
}) => {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "info":
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return COLORS.success;
      case "error":
        return COLORS.error;
      case "info":
        return COLORS.primary;
      default:
        return COLORS.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Ionicons name={getIconName()} size={80} color={getTextColor()} />
          <Text style={[styles.message, { color: getTextColor() }]}>
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            <CustomButton title="OK" onPress={onClose} variant="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    maxWidth: 400,
    padding: SIZES.large,
    borderRadius: SIZES.medium,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  message: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    textAlign: "center",
    marginBottom: SIZES.large,
    marginTop: SIZES.medium,
  },
  buttonContainer: {
    minWidth: 100,
  },
});
