import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 sm:w-3 sm:h-3",
    md: "w-6 h-6 sm:w-5 sm:h-5",
    lg: "w-8 h-8 sm:w-6 sm:h-6",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        "transition-all duration-200", // Smooth transitions
        sizeClasses[size],
        className,
      )}
    />
  )
}
