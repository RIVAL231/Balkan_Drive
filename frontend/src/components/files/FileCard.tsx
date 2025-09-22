"use client"

import { useState, useRef, useEffect, memo, useCallback } from "react"
import { MoreVertical, Download, Share2, Move, Eye, EyeOff, Trash2, Globe, Lock, FolderOpen, BarChart } from "lucide-react"
import { formatFileSize, formatRelativeTime, getFileIcon } from "@/lib/utils"
import ContextMenu from "@/components/ui/ContextMenu"
import { createPortal } from "react-dom"

/**
 * Props for the FileCard component
 */
interface FileCardProps {
  /** File data object containing all file information */
  file: {
    /** Unique file identifier */
    id: string
    /** Original filename with extension */
    filename: string
    /** MIME type of the file */
    filetype: string
    /** File size in bytes */
    filesize: number
    /** Whether file is publicly accessible */
    isPublic: boolean
    /** Whether file has public sharing enabled */
    isPublicShared: boolean
    /** Timestamp when public sharing was enabled */
    publicShareEnabledAt?: string
    /** User who enabled public sharing */
    publicShareEnabledBy?: {
      id: string
      username: string
    }
    /** File creation timestamp */
    createdAt: string
    /** File owner information */
    owner: {
      username: string
    }
  }
  /** Callback for sharing file with other users */
  onShare?: (fileId: string) => void
  /** Callback for deleting the file */
  onDelete?: (fileId: string) => void
  /** Callback for toggling file visibility (public/private) */
  onToggleVisibility?: (fileId: string, isPublic: boolean) => void
  /** Callback for downloading the file */
  onDownload?: () => void
  /** Callback for moving file to a different folder */
  onMoveToFolder?: (fileId: string) => void
  /** Callback for showing file download statistics */
  onShowStats?: (fileId: string, fileName: string) => void
  /** Callback for previewing the file */
  onPreview?: (file: {
    id: string
    filename: string
    filetype: string
    filesize: number
  }) => void
}

/**
 * FileCard component for displaying file information with actions
 * 
 * Features:
 * - File type icon and metadata display
 * - Context menu with file operations (download, share, delete, etc.)
 * - Public/private visibility indicators
 * - Responsive design with mobile-optimized touch targets
 * - Keyboard navigation support
 * - File statistics and download tracking
 * - Move to folder functionality
 * 
 * @example
 * ```tsx
 * <FileCard
 *   file={fileData}
 *   onShare={(fileId) => handleShare(fileId)}
 *   onDelete={(fileId) => handleDelete(fileId)}
 *   onToggleVisibility={(fileId, isPublic) => handleVisibilityChange(fileId, isPublic)}
 *   onDownload={() => handleDownload()}
 *   onMoveToFolder={(fileId) => handleMoveToFolder(fileId)}
 *   onShowStats={(fileId, fileName) => handleShowStats(fileId, fileName)}
 * />
 * ```
 */
function FileCard({ file, onShare, onDelete, onToggleVisibility, onDownload, onMoveToFolder, onShowStats, onPreview }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  })
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownMenuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)

  // Handle clicking outside dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && 
          menuButtonRef.current && 
          dropdownMenuRef.current &&
          !menuButtonRef.current.contains(event.target as Node) &&
          !dropdownMenuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        setMenuPosition(null)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuAction = useCallback((action: string) => {
    setShowMenu(false)

    switch (action) {
      case "preview":
        onPreview?.(file)
        break
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
        onToggleVisibility?.(file.id, !file.isPublicShared)
        break
      case "move-to-folder":
        console.log("Move to folder action triggered for file:", file.id);
        onMoveToFolder?.(file.id)
        break
      case "show-stats":
        onShowStats?.(file.id, file.filename)
        break
    }
  }, [file, onPreview, onDownload, onShare, onDelete, onToggleVisibility, onMoveToFolder, onShowStats])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 })
  }, [])

  const contextMenuItems = [
    {
      id: "preview",
      label: "Preview",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => handleMenuAction("preview"),
    },
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
      label: file.isPublicShared ? "Make private" : "Make public",
      onClick: () => handleMenuAction("toggle-visibility"),
    },
    ...(file.isPublicShared ? [{
      id: "show-stats",
      label: "View statistics",
      icon: <BarChart className="w-4 h-4" />,
      onClick: () => handleMenuAction("show-stats"),
    }] : []),
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
        className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow group cursor-move"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={handleContextMenu}
      >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 pr-2">
          <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.filetype)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 break-all leading-tight mb-1 max-w-full" 
                style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                title={file.filename}>
              {file.filename}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.filesize)} • {formatRelativeTime(file.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            ref={menuButtonRef}
            onClick={() => {
              if (!showMenu) {
                const rect = menuButtonRef.current?.getBoundingClientRect()
                if (rect) {
                  setMenuPosition({
                    x: rect.right - 192, // 192px = w-48 menu width
                    y: rect.bottom + 4
                  })
                }
              }
              setShowMenu(!showMenu)
            }}
            className="p-1.5 sm:p-1 rounded-lg hover:bg-gray-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-h-[44px] sm:min-h-auto flex items-center justify-center"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && menuPosition && createPortal(
            <div 
              ref={dropdownMenuRef}
              className="fixed w-64 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              style={{ left: menuPosition.x, top: menuPosition.y }}
            >
              <button
                onClick={() => handleMenuAction("preview")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => handleMenuAction("download")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => handleMenuAction("share")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={() => handleMenuAction("move-to-folder")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                <Move className="w-4 h-4" />
                <span>Move to folder</span>
              </button>

              <button
                onClick={() => handleMenuAction("toggle-visibility")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                {file.isPublicShared ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Make {file.isPublicShared ? "private" : "public"}</span>
              </button>

              {file.isPublicShared && (
                <button
                  onClick={() => handleMenuAction("show-stats")}
                  className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
                >
                  <BarChart className="w-4 h-4" />
                  <span>View statistics</span>
                </button>
              )}

              <hr className="my-1" />

              <button
                onClick={() => handleMenuAction("delete")}
                className="w-full px-3 py-2.5 sm:py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2 min-h-[44px] sm:min-h-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 truncate pr-2">by {file.owner.username}</span>
        <div className="flex items-center space-x-1 flex-shrink-0">
          {file.isPublicShared ? (
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
        onClose={handleCloseContextMenu}
      />
    )}
  </>
  )
}

export default memo(FileCard)
