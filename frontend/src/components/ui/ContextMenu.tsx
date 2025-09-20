"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

/**
 * Interface for individual context menu items
 */
interface ContextMenuItem {
  /** Unique identifier for the menu item */
  id: string
  /** Display label for the menu item */
  label: string
  /** Icon to display before the label */
  icon?: React.ReactNode
  /** Click handler for the menu item */
  onClick: () => void
  /** Whether the item is disabled */
  disabled?: boolean
}

/**
 * Props for the ContextMenu component
 */
interface ContextMenuProps {
  /** Array of menu items to display */
  items: ContextMenuItem[]
  /** Callback when menu should be closed */
  onClose: () => void
  /** Position coordinates for menu display */
  position: { x: number; y: number }
}

/**
 * ContextMenu component for right-click and action menus
 * 
 * Features:
 * - Portal rendering for proper z-index layering
 * - Smart positioning to stay within viewport
 * - Keyboard navigation support (Escape to close)
 * - Click outside to close functionality
 * - Disabled item states with visual feedback
 * - Icon support for menu items
 * - Mobile-friendly touch targets
 * - Smooth animations and transitions
 * 
 * @example
 * ```tsx
 * const menuItems = [
 *   { id: '1', label: "Download", icon: <Download />, onClick: handleDownload },
 *   { id: '2', label: "Share", icon: <Share />, onClick: handleShare },
 *   { id: '3', label: "Delete", icon: <Trash />, onClick: handleDelete, disabled: !canDelete }
 * ]
 * 
 * <ContextMenu
 *   items={menuItems}
 *   position={{ x: mouseX, y: mouseY }}
 *   onClose={() => setShowMenu(false)}
 * />
 * ```
 */
export default function ContextMenu({ items, onClose, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const menuRect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let { x, y } = position
      
      // Mobile: Center horizontally and show at bottom
      if (isMobile) {
        x = (viewportWidth - menuRect.width) / 2
        y = viewportHeight - menuRect.height - 20 // Bottom with margin
      } else {
        // Desktop: Adjust horizontal position if menu would overflow right edge
        if (x + menuRect.width > viewportWidth) {
          x = viewportWidth - menuRect.width - 10 // 10px margin from edge
        }
        
        // Desktop: Adjust vertical position if menu would overflow bottom edge
        if (y + menuRect.height > viewportHeight) {
          y = viewportHeight - menuRect.height - 10 // 10px margin from edge
        }
        
        // Ensure menu doesn't go off left or top edge
        x = Math.max(10, x)
        y = Math.max(10, y)
      }
      
      setAdjustedPosition({ x, y })
    }
  }, [position, isMobile])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return createPortal(
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}
      <div
        ref={menuRef}
        className={`
          fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50
          ${isMobile 
            ? 'min-w-[280px] max-w-[90vw] py-2 mx-4' 
            : 'min-w-48 py-1'
          }
        `}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            className={`
              w-full text-left flex items-center space-x-3 transition-colors
              ${isMobile 
                ? 'px-4 py-3 text-base min-h-[44px]' 
                : 'px-3 py-2 text-sm'
              }
              ${item.disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }
            `}
            onClick={() => {
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`}>
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </div>
    </>,
    document.body
  )
}