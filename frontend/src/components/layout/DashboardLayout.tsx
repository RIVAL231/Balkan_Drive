import type { ReactNode } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  )
}
