import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export default function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={cn("flex items-center text-sm mt-2", trend.isPositive ? "text-green-600" : "text-red-600")}>
              <span>{trend.isPositive ? "↗" : "↘"}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  )
}
