import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../constants/theme";

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SIZES.base,
  },
});
