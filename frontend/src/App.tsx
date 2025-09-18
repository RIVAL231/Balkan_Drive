"use client"

import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/auth"
import DashboardLayout from "./components/layout/DashboardLayout"
import LoadingSpinner from "./components/ui/LoadingSpinner"
// import "./App.css"

// Lazy load page components
const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const MyFiles = lazy(() => import("./pages/MyFiles"))
const SharedFiles = lazy(() => import("./pages/SharedFiles"))
const PublicFiles = lazy(() => import("./pages/PublicFiles"))
const Statistics = lazy(() => import("./pages/Statistics"))
const AdminPanel = lazy(() => import("./pages/AdminPanel"))
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"))

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
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/files" replace />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route path="/public" element={<PublicFiles />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/audit" element={<AuditLogsPage />} />
          {user.role === "admin" && <Route path="/admin" element={<AdminPanel />} />}
          <Route path="*" element={<Navigate to="/files" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  )
}

export default App
