import axios from "axios";

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Allow cookies for cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  upload: "/api/upload",
  chat: "/api/chat",
  health: "/api/health",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
  },
  docs: {
    list: "/api/docs",
    create: "/api/docs",
    update: (id) => `/api/docs/${id}`,
    delete: (id) => `/api/docs/${id}`,
  },
};

export default api;
