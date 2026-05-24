import { setBaseUrl } from "@workspace/api-client-react";
import { Platform } from "react-native";

const LOCAL_IP = "192.168.0.162";

// Replace this with your actual Railway URL
const PRODUCTION_API_URL = "https://real-estate-contacts-production.up.railway.app";

export const API_BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:3000`
  : PRODUCTION_API_URL;

console.log("API Base URL:", API_BASE_URL);
setBaseUrl(API_BASE_URL);