import { useState } from "react"
import axios from "axios"
import API_BASE from "../api/config"

const API = axios.create({ baseURL: API_BASE })
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function AdminData() {
  const [activeTab, setActiveTab] = useState("samples")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM samples LIMIT 10")
  const [sqlResults, setSqlResults] = useState(null)
  const [sqlError, setSqlError] = useState("")
  const [deleteMsg, setDeleteMsg] = useState("")
  const [sampleId, setSampleId] = useState("")

  const runSQL = () => {
    setSqlError("")
    API.post("/samples/query", { query: sqlQuery })
      .then(res => setSqlResults(res.data))
      .catch(err => setSqlError(err.response?.data?.detail || "Query error"))
  }

  const deleteSample = () => {
    if (!sampleId) return
    if (!window.confirm(`Delete sample ID ${sampleId}?`)) return
    API.delete(`/admin/samples/${sampleId}`)
      .then(() => { setDeleteMsg("✓ Sample deleted"); setSampleId("") })
      .catch(err => setDeleteMsg("Error: " + (err.response?.data?.detail || "Failed")))
  }

  const tabs = [["samples", "🗄️ Samples"], ["sql", "💻 SQL"]]

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🗄️ Data Management</h2>
        <a href="/admin/dashboard" style={{ color: "#c0392b", fontSize: 13 }}>← Back to Admin Dashboard</a>
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

      {activeTab === "samples" && (
        <div>
          <h3>Delete a Sample</h3>
          <p style={{ color: "#666", fontSize: 13 }}>Enter the database ID of the sample to delete (find it using <code>SELECT id, sample_id FROM samples</code> in the SQL tab)</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input placeholder="Sample DB ID (e.g. 3)" value={sampleId} onChange={e => setSampleId(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", width: 200 }} />
            <button onClick={deleteSample} style={{ padding: "8px 20px", background: "#e74c3c", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Delete Sample
            </button>
          </div>
          {deleteMsg && <p style={{ color: deleteMsg.startsWith("✓") ? "green" : "red", fontSize: 13 }}>{deleteMsg}</p>}
        </div>
      )}

      {activeTab === "sql" && (
        <div>
          <p style={{ color: "#666", fontSize: 13 }}>SELECT queries only. Tables: <code>samples</code>, <code>users</code>, <code>session_logs</code></p>
          <textarea value={sqlQuery} onChange={e => setSqlQuery(e.target.value)} rows={4}
            style={{ width: "100%", padding: 10, fontFamily: "monospace", fontSize: 13, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box" }} />
          <button onClick={runSQL} style={{ marginTop: 8, padding: "8px 20px", background: "#c0392b", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Run Query
          </button>
          {sqlError && <p style={{ color: "red" }}>{sqlError}</p>}
          {sqlResults && (
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <p style={{ fontSize: 13, color: "#666" }}>{sqlResults.count} rows</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    {sqlResults.rows[0] && Object.keys(sqlResults.rows[0]).map(col => (
                      <th key={col} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sqlResults.rows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{String(val ?? "—")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}