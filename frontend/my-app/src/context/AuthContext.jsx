import { useState, useEffect, useRef } from "react";
import { getMe } from "../api/auth";
import axios from "axios";
import { isAdminPath, getStoredToken, setStoredToken, clearStoredToken } from "./AuthStorage";
import { AuthContext } from "./AuthContextInstance";



const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000" });

// Regular users use localStorage (persists across tabs)
// Admin uses sessionStorage (isolated per tab)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const heartbeatRef = useRef(null)
  const isAdmin = useRef(isAdminPath())

  const sendHeartbeat = () => {
    const token = isAdmin.current
      ? sessionStorage.getItem("admin_token")
      : localStorage.getItem("token")
    if (!token) return
    API.post("/admin/sessions/heartbeat", {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {})
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    sendHeartbeat()
    heartbeatRef.current = setInterval(sendHeartbeat, 60 * 1000)
  }

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }

  useEffect(() => {
    isAdmin.current = isAdminPath()
    const token = getStoredToken()
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`
      getMe()
        .then((res) => { setUser(res.data); startHeartbeat() })
        .catch(() => clearStoredToken(isAdmin.current))
        .finally(() => setLoading(false))
    } else {
      setTimeout(() => setLoading(false), 0)
    }
    return () => stopHeartbeat()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveToken = (token, adminLogin = false) => {
    isAdmin.current = adminLogin
    setStoredToken(token, adminLogin)
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`
    getMe()
      .then((res) => { setUser(res.data); startHeartbeat() })
      .catch(() => clearStoredToken(adminLogin))
  }

  const signOut = () => {
    const token = isAdmin.current
      ? sessionStorage.getItem("admin_token")
      : localStorage.getItem("token")
    if (token) {
      API.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {})
    }
    clearStoredToken(isAdmin.current)
    setUser(null)
    stopHeartbeat()
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, setUser, saveToken, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}