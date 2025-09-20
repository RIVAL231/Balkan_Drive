import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  /** Title/label for the statistic */
  title: string
  /** The main value to display */
  value: string | number
  /** Optional icon to display */
  icon?: ReactNode
  /** Optional trend indicator */
  trend?: {
    /** Trend value (e.g., percentage change) */
    value: number
    /** Whether the trend is positive (green) or negative (red) */
    isPositive: boolean
  }
  /** Additional CSS classes */
  className?: string
}

/**
 * StatCard component for displaying statistics and metrics
 * 
 * Features:
 * - Clean card design with title and value
 * - Optional icon display
 * - Trend indicators with color coding
 * - Responsive design for mobile
 * - Consistent spacing and typography
 * - Accessible color contrast
 * 
 * @example
 * ```tsx
 * // Basic stat card
 * <StatCard title="Total Files" value={1234} icon={<FileIcon />} />
 * 
 * // With trend indicator
 * <StatCard 
 *   title="Storage Used" 
 *   value="2.4 GB" 
 *   trend={{ value: 12.5, isPositive: true }}
 *   icon={<HardDrive />}
 * />
 * 
 * // Simple text-only card
 * <StatCard title="Active Users" value={89} />
 * ```
 */
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
