import { setBaseUrl } from "@workspace/api-client-react";
import { Platform } from "react-native";

// Your Mac's local IP address
const LOCAL_IP = "192.168.0.162";

// API Configuration
export const API_BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:3000`
  : "https://your-production-api.com";

console.log("API Base URL:", API_BASE_URL);

// Set the base URL for the API client
setBaseUrl(API_BASE_URL);