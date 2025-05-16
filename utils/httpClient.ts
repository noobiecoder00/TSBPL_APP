import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const baseURL = "http://tbspl.aiplapps.com";

// Create axios instance with default config
const httpClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple request interceptor for token
httpClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export default httpClient;
