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
  TPI_SUBMIT: "/api/EquipmentTPIupdate",
  CHECKLIST_SUBMIT: "/api/EquipmentCheckListupdate",
  },

  // Daily Project endpoints
  DAILY_PROJECT: {
    LIST: "/api/DPR_list",
  },

  // Customer Billing endpoints
  CUSTOMER_BILLING: {
    LIST: "/api/Customer_Bill_Entry_list",
  },

  // Builder Billing endpoints
  BUILDER_BILLING: {
    LIST: "/api/Builder_Bill_Entry_list",
  },

  // Project No.
  PROJECT_NO: {
    LIST: "/api/ProjectMasterList",
  },

  // Sub Project No.
  SUB_PROJECT_NO: {
    LIST: "/api/SubProjectList",
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
