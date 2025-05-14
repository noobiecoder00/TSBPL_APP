// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/TBSPL/Construction/login",
    FORGOT: "/api/User/forgotPassword",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },

  // User endpoints
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile/update",
    CHANGE_PASSWORD: "/user/change-password",
  },

  // Vendor endpoints
  VENDOR: {
    LIST: "/api/Vendors",
  },

  // CW endpoints
  CW: {
    CREATE: "/api/cwMasterCreate",
    LIST: "/api/CWMasterlist",
    DETAILS: "/api/CW/details",
    SUBMIT: "/api/CWSubmit",
  },
} as const;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
