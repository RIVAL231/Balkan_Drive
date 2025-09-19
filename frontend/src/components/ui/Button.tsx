import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import LoadingSpinner from "./LoadingSpinner"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none"

    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 shadow-sm hover:shadow-md",
      secondary: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 focus:ring-gray-500 shadow-sm hover:shadow-md",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
      ghost: "hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-500",
    }

    const sizes = {
      sm: "px-2.5 py-1.5 text-sm min-h-[32px] sm:px-3 sm:py-1.5",
      md: "px-3 py-2 text-sm min-h-[40px] sm:px-4 sm:py-2 sm:text-base sm:min-h-[44px]", 
      lg: "px-4 py-2.5 text-base min-h-[44px] sm:px-6 sm:py-3 sm:text-lg sm:min-h-[48px]",
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-1.5 sm:mr-2" />}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
