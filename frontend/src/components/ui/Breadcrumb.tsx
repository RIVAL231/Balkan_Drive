import { ChevronRight, Home } from "lucide-react"
import { Link } from "react-router-dom"

/**
 * Interface for individual breadcrumb items
 */
interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string
  /** Optional link path (if not provided, item is not clickable) */
  href?: string
}

/**
 * Props for the Breadcrumb component
 */
interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb component for navigation hierarchy display
 * 
 * Features:
 * - Hierarchical navigation display with home icon
 * - Clickable links for navigation
 * - Responsive design with proper spacing
 * - Accessibility support with semantic nav element
 * - Visual separation with chevron icons
 * - Hover effects for interactive elements
 * 
 * @example
 * ```tsx
 * <Breadcrumb 
 *   items={[
 *     { label: "Documents", href: "/files/documents" },
 *     { label: "Report.pdf" }
 *   ]}
 * />
 * ```
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link to="/files" className="hover:text-gray-700 transition-colors">
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link to={item.href} className="hover:text-gray-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
