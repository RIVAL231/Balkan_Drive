"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/auth"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardLayout from "./components/layout/DashboardLayout"
import MyFiles from "./pages/MyFiles"
import SharedFiles from "./pages/SharedFiles"
import PublicFiles from "./pages/PublicFiles"
import Statistics from "./pages/Statistics"
import AdminPanel from "./pages/AdminPanel"
import LoadingSpinner from "./components/ui/LoadingSpinner"
// import "./App.css"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/files" replace />} />
        <Route path="/files" element={<MyFiles />} />
        <Route path="/shared" element={<SharedFiles />} />
        <Route path="/public" element={<PublicFiles />} />
        <Route path="/statistics" element={<Statistics />} />
        {user.role === "admin" && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="*" element={<Navigate to="/files" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default App
