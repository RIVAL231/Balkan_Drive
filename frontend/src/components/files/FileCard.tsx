"use client"

import { useState } from "react"
import { MoreVertical, Download, Share2, Move, Eye, EyeOff, Trash2, Globe, Lock, FolderOpen } from "lucide-react"
import { formatFileSize, formatRelativeTime, getFileIcon } from "@/lib/utils"
import ContextMenu from "@/components/ui/ContextMenu"

interface FileCardProps {
  file: {
    id: string
    filename: string
    filetype: string
    filesize: number
    isPublic: boolean
    createdAt: string
    owner: {
      username: string
    }
  }
  onShare?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  onToggleVisibility?: (fileId: string, isPublic: boolean) => void
  onDownload?: () => void
  onMoveToFolder?: (fileId: string) => void
}

export default function FileCard({ file, onShare, onDelete, onToggleVisibility, onDownload, onMoveToFolder }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  })

  const handleMenuAction = (action: string) => {
    setShowMenu(false)

    switch (action) {
      case "download":
        onDownload?.()
        break
      case "share":
        onShare?.(file.id)
        break
      case "delete":
        onDelete?.(file.id)
        break
      case "toggle-visibility":
        onToggleVisibility?.(file.id, !file.isPublic)
        break
      case "move-to-folder":
        onMoveToFolder?.(file.id)
        break
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
    })
  }

  const contextMenuItems = [
    {
      id: "download",
      label: "Download",
      icon: <Download className="w-4 h-4" />,
      onClick: () => handleMenuAction("download"),
    },
    {
      id: "move-to-folder",
      label: "Move to folder",
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: () => handleMenuAction("move-to-folder"),
    },
    {
      id: "share",
      label: "Share",
      icon: <Share2 className="w-4 h-4" />,
      onClick: () => handleMenuAction("share"),
    },
    {
      id: "toggle-visibility",
      label: file.isPublic ? "Make private" : "Make public",
      icon: file.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
      onClick: () => handleMenuAction("toggle-visibility"),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleMenuAction("delete"),
    },
  ]

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', file.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Prevent files from being drop targets
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'none'
    // Add visual feedback for invalid drop target
    const target = e.currentTarget as HTMLElement
    target.classList.add('cursor-not-allowed', 'opacity-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback when drag leaves
    const target = e.currentTarget as HTMLElement
    target.classList.remove('cursor-not-allowed', 'opacity-50')
  }

  const handleDrop = (e: React.DragEvent) => {
    // Prevent files from accepting drops
    e.preventDefault()
    e.stopPropagation()
    // Remove visual feedback after failed drop
    const target = e.currentTarget as HTMLElement
    target.classList.remove('cursor-not-allowed', 'opacity-50')
  }

  return (
    <>
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group cursor-move"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
      >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getFileIcon(file.filetype)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
              {file.filename}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.filesize)} • {formatRelativeTime(file.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => handleMenuAction("download")}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => handleMenuAction("share")}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={() => handleMenuAction("move")}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Move className="w-4 h-4" />
                <span>Move to folder</span>
              </button>

              <button
                onClick={() => handleMenuAction("toggle-visibility")}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                {file.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Make {file.isPublic ? "private" : "public"}</span>
              </button>

              <hr className="my-1" />

              <button
                onClick={() => handleMenuAction("delete")}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">by {file.owner.username}</span>
        <div className="flex items-center space-x-1">
          {file.isPublic ? (
            <Globe className="w-3 h-3 text-green-500" />
          ) : (
            <Lock className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    </div>

    {contextMenu.show && (
      <ContextMenu
        items={contextMenuItems}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={() => setContextMenu({ show: false, x: 0, y: 0 })}
      />
    )}
  </>
  )
}
