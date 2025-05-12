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

  // Add more endpoint categories as needed
  // Example:
  // POSTS: {
  //   LIST: '/posts',
  //   DETAIL: (id: string) => `/posts/${id}`,
  //   CREATE: '/posts',
  //   UPDATE: (id: string) => `/posts/${id}`,
  //   DELETE: (id: string) => `/posts/${id}`,
  // },
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
