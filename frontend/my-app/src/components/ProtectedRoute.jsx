import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

export function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin" replace />
  if (!user.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

export function UserRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.is_admin) return <Navigate to="/admin/dashboard" replace />
  return children
}
