import { type InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1 sm:space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 px-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2.5 sm:py-2 text-sm rounded-md border border-gray-300 placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          "transition-all duration-200",
          // Mobile optimizations
          "min-h-[44px] sm:min-h-[40px]", // Touch target size
          "text-base sm:text-sm", // Prevents zoom on iOS
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 px-1 leading-tight">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input
