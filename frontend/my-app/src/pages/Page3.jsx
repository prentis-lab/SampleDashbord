import { useState, useEffect } from "react"
import axios from "axios"
import API_BASE from "../api/config"

const API = axios.create({ baseURL: API_BASE })

export default function Page3() {
  const [changes, setChanges] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get("/samples/compare").then(res => {
      setChanges(res.data.changes || [])
      setMessage(res.data.message || "")
      setLoading(false)
    })
  }, [])

  if (loading) return <p style={{ textAlign: "center", marginTop: 80 }}>Loading comparison...</p>

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h2>Compare Original vs Updated</h2>
      <a href="/dashboard" style={{ fontSize: 13, color: "#666" }}>← Back to Dashboard</a>

      {message && <p style={{ color: "#666", marginTop: 20 }}>{message}</p>}

      {changes.length === 0 && !message && (
        <p style={{ color: "green", marginTop: 20 }}>✓ No changes detected — tables are identical.</p>
      )}

      {changes.map((change, i) => (
        <div key={i} style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ background: "#f8f8f8", padding: "10px 16px", borderBottom: "1px solid #ddd" }}>
            <strong>Row {change.row}</strong> — Sample ID: <code>{change.sample_id}</code>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#ffeeba" }}>
                <th style={{ padding: "8px 16px", textAlign: "left" }}>Field</th>
                <th style={{ padding: "8px 16px", textAlign: "left" }}>Original</th>
                <th style={{ padding: "8px 16px", textAlign: "left" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(change.changes).map(([field, vals]) => (
                <tr key={field}>
                  <td style={{ padding: "8px 16px", borderTop: "1px solid #eee", fontWeight: "bold" }}>{field}</td>
                  <td style={{ padding: "8px 16px", borderTop: "1px solid #eee", color: "#e74c3c", background: "#fff5f5" }}>{String(vals.original)}</td>
                  <td style={{ padding: "8px 16px", borderTop: "1px solid #eee", color: "#27ae60", background: "#f0fff4" }}>{String(vals.updated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {changes.length > 0 && (
        <p style={{ marginTop: 20, color: "#666", fontSize: 13 }}>
          Total: <strong>{changes.length}</strong> row(s) changed
        </p>
      )}
    </div>
  )
}