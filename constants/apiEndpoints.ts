// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    USER_LOGIN: "/TBSPL/Construction/login",
    VENDOR_LOGIN: "/api/vendor/login",
    FORGOT: "/api/User/forgotPassword",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },

  // User endpoints
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile/update",
    CHANGE_PASSWORD: "/api/User/changePassword",
    UPDATE_PASSWORD: "/api/User/updatePassword",
    FORGOT_PASSWORD: "/api/User/forgotPassword",
  },

  // Vendor endpoints
  VENDOR: {
    LIST: "/api/Vendors",
    UPDATE_PASSWORD: "/api/Vendor/updatePassword",
    CHANGE_PASSWORD: "/api/Vendor/changePassword",
    FORGOT_PASSWORD: "/api/Vendor/forgotPassword",
    TAKE_ATTENDANCE: "api/CW_Attendance",
    VIEW_ATTENDANCE: "/api/CW_Attendance_vendor_list",
  },

  // CW endpoints
  CW: {
    CREATE: "/api/cwMasterCreate",
    LIST: "/api/CWMasterlist",
    DETAILS: "/api/CW/details",
    FLOW_ACTION: "/api/CWMasterFlowAction",
    UPDATE: "/api/CWMasterUpdate",
    GENERATE_GATEPASS: "/api/cwGatePass",
  },

  // Attendance endpoints
  ATTENDANCE: {
    LIST: "/api/CW_Attendance_list",
    DETAILS: "/api/CW_Attendance/details",
    APPROVE: "/api/CW_Attendance/approve",
    REJECT: "/api/CW_Attendance/reject",
    UPDATE_ATTENDANCE: "/api/cwAttendance/UpdateAttendanceApproval",
    FLOW_ACTION: "/api/CWAttendanceFlowAction",
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
    CREATE: "/api/BuilderBillEntryCreate",
    DETAILS: "/api/Builderbill/details",
    FLOW_ACTION: "/api/Builder_FlowAction",
    UPDATE: "/api/Builder_Update",
  },

  // Project No.
  PROJECT_NO: {
    LIST: "/api/ProjectMasterList",
  },

  // Sub Project No.
  SUB_PROJECT_NO: {
    LIST: "/api/SubProjectList",
  },

  // Sub Project Scope
  SUB_PROJECT_SCOPE: {
    LIST: "/api/SubProjectScope",
  },

  // Sub Project Vendor
  SUB_PROJECT_VENDOR: {
    LIST: "/api/SubProjectVendorList",
  },

  // Sub Project Equipment
  SUB_PROJECT_EQUIPMENT: {
    LIST: "/api/SubProjectEquipments",
  },

  // DPR Create
  DPR_CREATE: {
    CREATE: "/api/DailyProjectProgressEntryCreate",
  },

  // DPR Details
  DPR_DETAILS: {
    DETAILS: "/api/DPRbill/details",
  },

  // DPR Flow Action
  DPR_FLOW_ACTION: {
    FLOW_ACTION: "/api/DPR_FlowAction",
  },

  // DPR Update
  DPR_UPDATE: {
    UPDATE: "/api/DPR_Update",
  },

  // Customer Billing Create
  CUSTOMER_BILLING_CREATE: {
    CREATE: "/api/CustomerBillEntryCreate",
  },

  // Customer Billing Scope
  CUSTOMER_BILLING_SCOPE: {
    LIST: "/api/CustomerScope",
  },

  // Customer Billing Details
  CUSTOMER_BILLING_DETAILS: {
    DETAILS: "/api/customerbill/details",
  },

  // Customer Billing Flow Action
  CUSTOMER_BILLING_FLOW_ACTION: {
    FLOW_ACTION: "/api/Customer_FlowAction",
  },

  // Customer Billing Update
  CUSTOMER_BILLING_UPDATE: {
    UPDATE: "/api/Customer_Update",
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
