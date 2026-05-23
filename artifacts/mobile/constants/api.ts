import { setBaseUrl } from "@workspace/api-client-react";
import { Platform } from "react-native";

// API Configuration
// iOS simulator can use localhost
// Android emulator needs 10.0.2.2
// Physical devices need your computer's actual IP address
export const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000"
  : "https://your-production-api.com";

console.log("API Base URL:", API_BASE_URL);

// Set the base URL for the API client
setBaseUrl(API_BASE_URL);