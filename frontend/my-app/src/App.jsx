import { BrowserRouter, Routes, Route } from "react-router-dom"
import Welcome from "./pages/Welcome"
import Login from "./pages/Login"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminData from "./pages/AdminData"
import Dashboard from "./pages/Dashboard"
import Page1 from "./pages/Page1"
import Page2 from "./pages/Page2"
import Page3 from "./pages/Page3"
import { AdminRoute, UserRoute } from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/data" element={<AdminRoute><AdminData /></AdminRoute>} />
        <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
        <Route path="/page1" element={<UserRoute><Page1 /></UserRoute>} />
        <Route path="/page2" element={<UserRoute><Page2 /></UserRoute>} />
        <Route path="/page3" element={<UserRoute><Page3 /></UserRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App