import { useState, useEffect } from "react"
import axios from "axios"

import API_BASE from "../api/config"
const API = axios.create({ baseURL: API_BASE })

const FIELDS = [
  ["type", "Type"], ["technology", "Technology"], ["group", "Group"],
  ["sample_id", "Sample ID"], ["parent_1", "Parent 1"], ["parent_2", "Parent 2"],
  ["species_variety", "Species/Variety"], ["phenotype_treatment", "Phenotype/Treatment"],
  ["tissue_sampled", "Tissue Sampled"], ["date", "Date"], ["data_location", "Data Location"],
  ["file_prefix", "File Prefix"], ["project_leaders", "Project Leaders"],
  ["project_investigators", "Project Investigators"], ["project_id", "Project ID"],
  ["project_details", "Project Details"], ["other_notes", "Other Notes"],
  ["rdss_location", "RDSS Location"]
]

export default function Page2() {
  const [prefixes, setPrefixes] = useState([])
  const [search, setSearch] = useState("")
  const [selectedPrefix, setSelectedPrefix] = useState(null)
  const [rows, setRows] = useState([])
  const [editedRows, setEditedRows] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    API.get("/samples/prefixes").then(res => setPrefixes(res.data))
  }, [])

  const selectPrefix = (prefix) => {
    setSelectedPrefix(prefix)
    setEditedRows({})
    setSaved(false)
    API.get(`/samples/prefix/${encodeURIComponent(prefix)}`).then(res => {
      setRows(res.data)
      const initial = {}
      res.data.forEach(row => { initial[row.id] = { ...row } })
      setEditedRows(initial)
    })
  }

  const handleChange = (rowId, field, value) => {
    setEditedRows(prev => ({ ...prev, [rowId]: { ...prev[rowId], [field]: value } }))
  }

  const saveAll = async () => {
    for (const row of rows) {
      await API.put(`/samples/${row.id}`, editedRows[row.id])
    }
    setSaved(true)
  }

  const filtered = prefixes.filter(p => p.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h2>Edit by File Prefix</h2>
      <a href="/dashboard" style={{ fontSize: 13, color: "#666" }}>← Back to Dashboard</a>

      {/* Search + Dropdown */}
      <div style={{ margin: "20px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <input
          placeholder="Search file prefix..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 260 }}
        />
        <select onChange={e => selectPrefix(e.target.value)} value={selectedPrefix || ""}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 260 }}>
          <option value="">— Select a file prefix —</option>
          {filtered.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Edit Table */}
      {rows.length > 0 && (
        <>
          <p style={{ color: "#666", fontSize: 13 }}>{rows.length} row(s) found for <strong>{selectedPrefix}</strong></p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  {FIELDS.map(([, label]) => (
                    <th key={label} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "2px solid #ddd", whiteSpace: "nowrap" }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    {FIELDS.map(([field]) => (
                      <td key={field} style={{ padding: "4px 8px", borderBottom: "1px solid #eee" }}>
                        <input
                          value={editedRows[row.id]?.[field] ?? ""}
                          onChange={e => handleChange(row.id, field, e.target.value)}
                          style={{ width: "100%", padding: "4px 6px", border: "1px solid #ddd", borderRadius: 3, fontSize: 12, minWidth: 120 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={saveAll} style={{
            marginTop: 16, padding: "10px 28px", background: "#2ecc71",
            color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14
          }}>
            💾 Update
          </button>
          {saved && <span style={{ marginLeft: 12, color: "green", fontSize: 13 }}>✓ Saved and exported to example_sample_updated.xlsx</span>}
        </>
      )}
    </div>
  )
}