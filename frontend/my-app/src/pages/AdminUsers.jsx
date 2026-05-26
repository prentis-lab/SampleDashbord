import { useState, useEffect } from "react"
import axios from "axios"
import API_BASE from "../api/config"

const API = axios.create({ baseURL: API_BASE })
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers["X-Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone
  return config
})

const spinStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinning { animation: spin 0.8s linear infinite; display: inline-block; }
`

const formatTime = (utcString) => {
  if (!utcString) return ""
  // Backend already returns local time - just format it nicely
  const date = new Date(utcString.replace(" ", "T"))
  return date.toLocaleString("en-AU", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  })
}



export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("sessions")
  const [users, setUsers] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [sessionHistory, setSessionHistory] = useState([])
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [userMsg, setUserMsg] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchUsers = () => {
    API.get("/admin/users").then(res => setUsers(res.data))
  }

  const fetchSessions = () => {
    setRefreshing(true)
    Promise.all([
      API.get("/admin/sessions/active").then(res => {
        console.log("Raw session data:", res.data)
        setActiveSessions(res.data)
      }),
      API.get("/admin/sessions/history").then(res => setSessionHistory(res.data))
    ]).finally(() => setTimeout(() => setRefreshing(false), 600))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "users") fetchUsers()
      if (activeTab === "sessions") fetchSessions()
    }, 0)
    return () => clearTimeout(timer)
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "sessions") return
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [activeTab])

  const addUser = () => {
    setUserMsg("")
    API.post("/admin/users", { email: newEmail, password: newPassword, is_admin: newIsAdmin })
      .then(() => { setUserMsg("✓ User created"); setNewEmail(""); setNewPassword(""); fetchUsers() })
      .catch(err => setUserMsg("Error: " + (err.response?.data?.detail || "Failed")))
  }

  const approveUser = (id) => {
    API.post(`/admin/users/${id}/approve`)
      .then(() => fetchUsers())
      .catch(err => alert(err.response?.data?.detail || "Failed to approve"))
  }

  const removeUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    API.delete(`/admin/users/${id}`)
      .then(() => fetchUsers())
      .catch(err => alert(err.response?.data?.detail || "Failed to delete"))
  }

  const pendingUsers = users.filter(u => !u.is_active)
  const activeUsers  = users.filter(u => u.is_active)

  const tabs = [["sessions", "🟢 Online Users"], ["users", "👥 Users"]]

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <style>{spinStyle}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>👥 User Management</h2>
        <div style={{ textAlign: "right" }}>
          <a href="/admin/dashboard" style={{ color: "#c0392b", fontSize: 13, display: "block" }}>← Back to Admin Dashboard</a>
          <span style={{ fontSize: 12, color: "#999" }}>
            🕐 Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: "8px 20px", borderRadius: 4, border: "none", cursor: "pointer",
            background: activeTab === key ? "#c0392b" : "#eee",
            color: activeTab === key ? "white" : "#333"
          }}>{label}</button>
        ))}
      </div>

      {activeTab === "sessions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>🟢 Currently Online ({activeSessions.length})</h3>
            <button
              onClick={fetchSessions}
              disabled={refreshing}
              style={{
                padding: "6px 14px",
                background: refreshing ? "#95a5a6" : "#3498db",
                color: "white", border: "none", borderRadius: 4,
                cursor: refreshing ? "not-allowed" : "pointer",
                fontSize: 13, display: "flex", alignItems: "center", gap: 6
              }}
            >
              <span className={refreshing ? "spinning" : ""}>🔄</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {activeSessions.length === 0
            ? <p style={{ color: "#666", fontSize: 14 }}>No users currently online.</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 32 }}>
                <thead>
                  <tr style={{ background: "#f0fff0" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Email</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Logged In At</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", marginRight: 8 }} />
                        {s.email}
                      </td>
                      <td style={{ padding: "8px 12px" }}>{formatTime(s.login_time)}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#27ae60" }}>{s.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }

          <h3>📋 Session History (last 100)</h3>
          {sessionHistory.length === 0
            ? <p style={{ color: "#666", fontSize: 14 }}>No session history yet.</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Email</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Login</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Logout</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 12px" }}>{s.email}</td>
                      <td style={{ padding: "8px 12px" }}>{formatTime(s.login_time)}</td>
                      <td style={{ padding: "8px 12px" }}>{formatTime(s.logout_time)}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{s.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h3>Add New User</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 220 }} />
            <input placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 160 }} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
              <input type="checkbox" checked={newIsAdmin} onChange={e => setNewIsAdmin(e.target.checked)} />
              Admin
            </label>
            <button onClick={addUser} style={{ padding: "8px 20px", background: "#c0392b", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Add User
            </button>
          </div>
          {userMsg && <p style={{ color: userMsg.startsWith("✓") ? "green" : "red", fontSize: 13 }}>{userMsg}</p>}

          {pendingUsers.length > 0 && (
            <>
              <h3 style={{ marginTop: 24, color: "#e67e22" }}>⏳ Pending Approval ({pendingUsers.length})</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "#fef9e7" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Email</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #fdebd0" }}>
                      <td style={{ padding: "8px 12px" }}>{u.id}</td>
                      <td style={{ padding: "8px 12px" }}>{u.email}</td>
                      <td style={{ padding: "8px 12px", display: "flex", gap: 8 }}>
                        <button onClick={() => approveUser(u.id)} style={{ padding: "4px 12px", background: "#27ae60", color: "white", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 12 }}>
                          Approve
                        </button>
                        <button onClick={() => removeUser(u.id)} style={{ padding: "4px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 12 }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h3 style={{ marginTop: 24 }}>Active Users ({activeUsers.length})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Admin</th>
                <th style={{ padding: "8px 12px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 12px" }}>{u.id}</td>
                  <td style={{ padding: "8px 12px" }}>{u.email}</td>
                  <td style={{ padding: "8px 12px" }}>{u.is_admin ? "✅" : "—"}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <button onClick={() => removeUser(u.id)} style={{ padding: "4px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 12 }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}