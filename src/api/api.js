import axios from "axios";

// Create a base Axios instance
const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? "/api/n8n" // Use proxy in development
    : "https://ayk1.app.n8n.cloud/webhook", // Direct in production
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the latest JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 JWT Token attached to request:", config.url);
    } else {
      console.warn("⚠️ No JWT token found in localStorage for request:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Axios interceptor error:", error);
    return Promise.reject(error);
  }
);

export default api;