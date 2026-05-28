import { useAuth } from "../context/useAuth"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function Dashboard() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [downloadError, setDownloadError] = useState("")

  const handleLogout = () => {
    signOut()
    navigate("/")
  }

  const downloadFile = (type) => {
    setDownloadError("")
    const token = localStorage.getItem("token")
    fetch(`${API_BASE}/samples/download/${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(
          type === "updated"
            ? "No updates have been made yet — edit a sample on the Edit by File Prefix page first."
            : "Original file not found."
        )
        return res.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = type === "original" ? "samples_original.csv" : "samples_updated.csv"
        a.click()
        window.URL.revokeObjectURL(url)
        setDownloadError("")
      })
      .catch(err => setDownloadError(err.message))
  }

  if (loading) return <p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>
  if (!user) return <p style={{ textAlign: "center", marginTop: 80 }}>Not logged in. <a href="/">Go to login</a></p>

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Welcome 👋</h2>
        <button
          onClick={handleLogout}
          style={{ padding: "5px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
        >
          Log Out
        </button>
      </div>

      <p>You are logged in as: <strong>{user.email}</strong></p>

      <h3 style={{ marginTop: 24, marginBottom: 12 }}>Pages</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/page1" style={{ padding: "10px 20px", background: "#3498db", color: "white", borderRadius: 4, textDecoration: "none" }}>
          🔍 Sample Explorer
        </a>
        <a href="/page2" style={{ padding: "10px 20px", background: "#2ecc71", color: "white", borderRadius: 4, textDecoration: "none" }}>
          ✏️ Edit by File Prefix
        </a>
        <a href="/page3" style={{ padding: "10px 20px", background: "#9b59b6", color: "white", borderRadius: 4, textDecoration: "none" }}>
          📊 Compare Original vs Updated
        </a>
      </div>

      <h3 style={{ marginTop: 32, marginBottom: 12 }}>Downloads</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => downloadFile("original")}
          style={{ padding: "10px 20px", background: "#e67e22", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          ⬇️ Download Original
        </button>
        <button
          onClick={() => downloadFile("updated")}
          style={{ padding: "10px 20px", background: "#16a085", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          ⬇️ Download Updated
        </button>
      </div>

      {downloadError && (
        <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 10, padding: "8px 12px", background: "#fff5f5", border: "1px solid #fcc", borderRadius: 4 }}>
          ⚠️ {downloadError}
        </p>
      )}

      <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
        Updated file is only available after making edits on the Edit by File Prefix page.
      </p>
    </div>
  )
}