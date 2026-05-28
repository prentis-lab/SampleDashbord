import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth";


export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate("/")
  }

  return (
    <div style={{ maxWidth: 700, margin: "80px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <div style={{ background: "#c0392b", color: "white", padding: "24px 32px", borderRadius: 8, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>🔒 Admin Dashboard</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85 }}>Logged in as <strong>{user?.email}</strong></p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: "6px 14px", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
        >
          Log Out
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div
          onClick={() => navigate("/admin/users")}
          style={{ padding: 24, border: "2px solid #c0392b", borderRadius: 8, cursor: "pointer", background: "white" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}
        >
          <h3 style={{ margin: "0 0 8px", color: "#c0392b" }}>👥 User Management</h3>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>View online users, add, remove and manage user accounts</p>
        </div>

        <div
          onClick={() => navigate("/admin/data")}
          style={{ padding: 24, border: "2px solid #c0392b", borderRadius: 8, cursor: "pointer", background: "white" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}
        >
          <h3 style={{ margin: "0 0 8px", color: "#c0392b" }}>🗄️ Data Management</h3>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Remove samples and run SQL queries on the database</p>
        </div>

      </div>
    </div>
  )
}