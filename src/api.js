// src/api.js
import axios from "axios";

export const API_URL = "http://localhost:8000/api";   // API routes
export const APP_URL = "http://localhost:8000";       // Laravel public root

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
