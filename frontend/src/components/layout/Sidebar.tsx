"use client"

import { NavLink } from "react-router-dom"
import { Folder, Share2, Globe, BarChart3, Shield } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "My Files", href: "/files", icon: Folder },
  { name: "Shared Files", href: "/shared", icon: Share2 },
  { name: "Public Files", href: "/public", icon: Globe },
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-20">
      <nav className="px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100",
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100",
              )
            }
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  )
}
