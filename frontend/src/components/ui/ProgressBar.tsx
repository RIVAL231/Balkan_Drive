import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
  color?: "blue" | "green" | "yellow" | "red"
  className?: string
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  color = "blue",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{label}</span>
          {showPercentage && <span className="text-gray-500">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-300", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
