"use client"

import { NavLink } from "react-router-dom"
import { Folder, Share2, Globe, BarChart3, Shield, Activity, X } from "lucide-react"
import { useAuth } from "@/hooks/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "My Files", href: "/files", icon: Folder },
  { name: "Shared Files", href: "/shared", icon: Share2 },
  { name: "Public Files", href: "/public", icon: Globe },
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-16 sm:pt-20 z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <nav className="px-3 sm:px-4 py-6 space-y-1 sm:space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose?.()} // Close sidebar on mobile after navigation
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100",
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
          
          {user?.role === "admin" && (
            <NavLink
              to="/audit"
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100",
                )
              }
            >
              <Activity className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">My Activity</span>
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100",
                )
              }
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Admin</span>
            </NavLink>
          )}
        </nav>
      </div>
    </>
  )
}
