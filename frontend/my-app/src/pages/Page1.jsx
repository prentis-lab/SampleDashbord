import { useState, useEffect } from "react"
import axios from "axios"

import API_BASE from "../api/config"
const API = axios.create({ baseURL: API_BASE })

export default function Page1() {
  const [filters, setFilters] = useState({ type: "", technology: "", group: "", project_id: "" })
  const [filterOptions, setFilterOptions] = useState({ types: [], technologies: [], groups: [], project_ids: [] })
  const [samples, setSamples] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM samples LIMIT 10")
  const [sqlResults, setSqlResults] = useState(null)
  const [sqlError, setSqlError] = useState("")
  const [activeTab, setActiveTab] = useState("filter")

  const fetchSamples = () => {
    const params = { ...filters, page, page_size: 20, search }
    Object.keys(params).forEach(k => !params[k] && delete params[k])
    API.get("/samples/", { params }).then(res => {
      setSamples(res.data.items)
      setTotal(res.data.total)
    })
  }

    useEffect(() => {
    API.get("/samples/filters").then(res => setFilterOptions(res.data))
  }, [])

  useEffect(() => {
    fetchSamples()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, search])

  const runSQL = () => {
    setSqlError("")
    if (!sqlQuery.trim().toLowerCase().startsWith("select")) {
      setSqlError("Only SELECT queries are allowed.")
      return
    }
    API.post("/samples/query", { query: sqlQuery })
      .then(res => setSqlResults(res.data))
      .catch(err => setSqlError(err.response?.data?.detail || "Query error"))
  }

  const columns = ["type", "technology", "group", "sample_id", "file_prefix", "project_id", "date"]

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h2>Sample Explorer</h2>
      <a href="/dashboard" style={{ fontSize: 13, color: "#666" }}>← Back to Dashboard</a>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        {["filter", "sql"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 20px", borderRadius: 4, border: "none", cursor: "pointer",
            background: activeTab === tab ? "#3498db" : "#eee",
            color: activeTab === tab ? "white" : "#333"
          }}>
            {tab === "filter" ? "Filter View" : "SQL Query"}
          </button>
        ))}
      </div>

      {activeTab === "filter" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              placeholder="Search sample ID or prefix..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 220 }}
            />
            {[["type", "Type"], ["technology", "Technology"], ["group", "Group"], ["project_id", "Project ID"]].map(([key, label]) => (
              <select key={key} value={filters[key]} onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1) }}
                style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}>
                <option value="">All {label}s</option>
                {(filterOptions[key + "s"] || filterOptions[key + "_ids"] || []).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ))}
            <button onClick={() => { setFilters({ type: "", technology: "", group: "", project_id: "" }); setSearch(""); setPage(1) }}
              style={{ padding: 8, background: "#e74c3c", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Clear
            </button>
          </div>

          <p style={{ color: "#666", fontSize: 13 }}>{total} results found</p>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  {columns.map(col => <th key={col} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                    {columns.map(col => <td key={col} style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{s[col] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "6px 14px", cursor: "pointer" }}>← Prev</button>
            <span>Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
              style={{ padding: "6px 14px", cursor: "pointer" }}>Next →</button>
          </div>
        </>
      )}

      {activeTab === "sql" && (
        <div>
          <p style={{ color: "#666", fontSize: 13 }}>Only SELECT queries are allowed. Table name is <code>samples</code>.</p>
          <textarea
            value={sqlQuery}
            onChange={e => setSqlQuery(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 10, fontFamily: "monospace", fontSize: 13, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box" }}
          />
          <button onClick={runSQL} style={{ marginTop: 8, padding: "8px 20px", background: "#2ecc71", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Run Query
          </button>
          {sqlError && <p style={{ color: "red", marginTop: 8 }}>{sqlError}</p>}
          {sqlResults && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "#666", fontSize: 13 }}>{sqlResults.count} rows returned</p>
              <div style={{ overflowX: "auto" }}>
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}