"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  onClose: () => void
  position: { x: number; y: number }
}

export default function ContextMenu({ items, onClose, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-48"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
            item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
          }`}
          onClick={() => {
            if (!item.disabled) {
              item.onClick()
              onClose()
            }
          }}
          disabled={item.disabled}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  )
}