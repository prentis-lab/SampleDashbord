import axios from "axios";
import API_BASE from "./config";

const API = axios.create({ baseURL: API_BASE });

API.interceptors.request.use((config) => {
    // Use admin token if on admin path, otherwise regular token
    const isAdmin = window.location.pathname.startsWith("/admin")
    const token = isAdmin
        ? sessionStorage.getItem("admin_token")
        : localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const register = (email, password) =>
    API.post("/auth/register", { email, password });

export const login = (email, password) =>
    API.post("/auth/login", { email, password });

export const logout = () => API.post("/auth/logout");

export const getMe = () => API.get("/auth/me");

export const googleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
};

export const adminLogin = (email, password) =>
    API.post("/auth/admin-login", { email, password });