import { cn } from "@/lib/utils"

/**
 * Props for the ProgressBar component
 */
interface ProgressBarProps {
  /** Current progress value */
  value: number
  /** Maximum possible value */
  max: number
  /** Optional label to display above the progress bar */
  label?: string
  /** Whether to show percentage text (default: true) */
  showPercentage?: boolean
  /** Color theme for the progress bar (default: "blue") */
  color?: "blue" | "green" | "yellow" | "red"
  /** Additional CSS classes */
  className?: string
}

/**
 * ProgressBar component for displaying progress and completion states
 * 
 * Features:
 * - Customizable progress value and maximum
 * - Color variants for different states (blue, green, yellow, red)
 * - Optional label and percentage display
 * - Responsive design with proper accessibility
 * - Smooth visual progress indication
 * - Clean styling with rounded corners
 * 
 * @example
 * ```tsx
 * // Basic progress bar
 * <ProgressBar value={75} max={100} />
 * 
 * // Storage usage with custom color and label
 * <ProgressBar 
 *   value={storageUsed} 
 *   max={storageLimit} 
 *   label="Storage Usage"
 *   color={storageUsed > storageLimit * 0.9 ? "red" : "green"}
 *   showPercentage
 * />
 * 
 * // File upload progress
 * <ProgressBar 
 *   value={uploadProgress} 
 *   max={100} 
 *   label="Uploading file..."
 *   color="blue"
 * />
 * ```
 */
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
