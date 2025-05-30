export const COLORS = {
  primary: "#007AFF", // Light blue
  secondary: "#4A90E2", // Dark blue
  background: "#FFFFFF", // White
  text: "#000000",
  error: "#dc3545",
  success: "#198754",
  warning: "#ffc107",
  info: "#0dcaf0",
  gray: "#a2a2a3",
  lightGray: "#d3d3d3",
  veryLightGray: "#e5e5e5",
  white: "#FFFFFF",
};

export const FONTS = {
  regular: {
    fontFamily: "System",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: "System",
    fontWeight: "500" as const,
  },
  bold: {
    fontFamily: "System",
    fontWeight: "700" as const,
  },
};

export const SIZES = {
  base: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
};
