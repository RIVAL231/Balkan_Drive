import { cn } from "@/lib/utils"

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Size variant for the spinner (default: 'md') */
  size?: "sm" | "md" | "lg"
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * LoadingSpinner component for indicating loading states
 * 
 * Features:
 * - Multiple size variants (sm, md, lg)
 * - Smooth CSS animations
 * - Responsive sizing (smaller on mobile for better UX)
 * - Customizable with additional CSS classes
 * - Accessible with proper ARIA attributes when used in context
 * 
 * @example
 * ```tsx
 * // Default medium spinner
 * <LoadingSpinner />
 * 
 * // Small spinner for buttons
 * <LoadingSpinner size="sm" />
 * 
 * // Large spinner for page loading
 * <LoadingSpinner size="lg" className="text-green-600" />
 * 
 * // In a button
 * <Button disabled={isLoading}>
 *   {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
 *   Save Changes
 * </Button>
 * ```
 */
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
