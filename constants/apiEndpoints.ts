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
    FLOW_ACTION: "/api/CWMasterFlowAction",
    UPDATE: "/api/CWMasterUpdate",
  },

  // Safety endpoints
SAFETY: {
  TPI_EXPIRY: "/api/TPI-data",
  CHECKLIST: "/api/checklist-data",
  TPI_DETAILS: "/api/CategoryChecklist/details",
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
