import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { adminLogin } from "../api/auth"
import { useAuth } from "../context/useAuth"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await adminLogin(email, password)
      saveToken(res.data.access_token, true)
      navigate("/admin/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Access denied")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "48px 40px",
        borderRadius: 8,
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 32 }}>🔐</span>
          <h2 style={{ margin: "12px 0 4px", fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>
            Admin Access
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Restricted — Authorised Personnel Only</p>
        </div>

        {/* Warning banner */}
        <div style={{
          background: "#fffbf0",
          border: "1px solid #f0d080",
          borderRadius: 5,
          padding: "10px 14px",
          marginBottom: 24,
          fontSize: 12,
          color: "#856404",
          textAlign: "center"
        }}>
          ⚠️ All admin activity is monitored and logged
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>
              Admin Email
            </label>
            <input
              id="admin-email" name="email" type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "10px 12px",
                border: "1px solid #ddd", borderRadius: 5, fontSize: 14,
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>
              Password
            </label>
            <input
              id="admin-password" name="password" type="password"
              autoComplete="current-password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "10px 12px",
                border: "1px solid #ddd", borderRadius: 5, fontSize: 14,
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fcc",
              borderRadius: 5, padding: "10px 12px", marginBottom: 16,
              fontSize: 13, color: "#c0392b"
            }}>
              {error}
            </div>
          )}

          <button type="submit" style={{
            width: "100%", padding: "11px",
            background: "#1a1a2e", color: "white",
            border: "none", borderRadius: 5,
            fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}>
            Sign In as Admin
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#bbb" }}>
          Not an admin?{" "}
          <a href="/login" style={{ color: "#555" }}>User Login</a>
          {" · "}
          <a href="/" style={{ color: "#bbb" }}>← Welcome</a>
        </p>
      </div>
    </div>
  )
}