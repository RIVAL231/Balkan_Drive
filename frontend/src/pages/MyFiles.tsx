"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, Grid, List, Search, FolderOpen, Edit, Trash2, Share, Download, Move, BarChart3 } from "lucide-react"
import { useFiles, useFolders, useFileOperations, useDownloadUrl } from "@/hooks/useFiles"
import { useShareFilePublicly, useUnshareFilePublicly } from "@/hooks/usePublicFiles"
import { useSearch } from "@/hooks/useSearch"
import { useAlertModal, useConfirmModal } from "@/hooks/useModal"
import { AlertModal, ConfirmModal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Breadcrumb from "@/components/ui/Breadcrumb"
import FileCard from "@/components/files/FileCard"
import SearchBar from "@/components/files/SearchBar"
import UploadZone from "@/components/files/UploadZone"
import CreateFolderModal from "@/components/files/CreateFolderModal"
import RenameFolderModal from "@/components/files/RenameFolderModal"
import ShareByUsernameModal from "@/components/files/ShareByUsernameModal"
import MoveToFolderModal from "@/components/files/MoveToFolderModal"
import FileDownloadStatsModal from "@/components/files/FileDownloadStatsModal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ContextMenu from "@/components/ui/ContextMenu"

/**
 * Interface for file data structure used in the MyFiles component
 */
interface FileType {
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

/**
 * MyFiles page component - Main file management interface
 * 
 * Features:
 * - File and folder browsing with breadcrumb navigation
 * - Grid and list view modes for file display
 * - File upload with drag-and-drop support
 * - Folder creation and management
 * - File operations (download, share, delete, move, rename)
 * - Search functionality across files and folders
 * - Public sharing and visibility controls
 * - File download statistics
 * - Context menus and keyboard shortcuts
 * - Responsive design with mobile support
 * - Real-time updates and error handling
 * 
 * @example
 * ```tsx
 * // Used as a route component
 * <Route path="/files" component={MyFiles} />
 * 
 * // Can also be embedded in other components
 * <MyFiles />
 * ```
 */

interface FolderType {
  id: string
  name: string
}

export default function MyFiles() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<string | undefined>()
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([])
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [fileToMove, setFileToMove] = useState<string | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [statsFileId, setStatsFileId] = useState<string>("")
  const [statsFileName, setStatsFileName] = useState<string>("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  // Navigation history stack (allow undefined for root)
  const [folderHistory, setFolderHistory] = useState<(string | undefined)[]>([])
  // Rename folder modal state
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [folderToRename, setFolderToRename] = useState<{id: string, name: string} | null>(null)
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [fileToShare, setFileToShare] = useState<{id: string, name: string} | null>(null)
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    position: { x: number; y: number }
    type: 'folder' | 'file'
    item: { id: string; name: string } | null
  }>({
    show: false,
    position: { x: 0, y: 0 },
    type: 'folder',
    item: null
  })

  // Initialize search with current folder context
  const { 
    searchState, 
    search, 
    clearSearch, 
    loadMore, 
    updateFilters,
    canLoadMore,
    totalResults
  } = useSearch({ folderId: currentFolder })

  const { files, loading: filesLoading, refetch: refetchFiles } = useFiles(currentFolder)
  const { folders, refetch: refetchFolders } = useFolders(currentFolder)
  const { deleteFile, deleteFolder, renameFolder, shareFileByUsername, moveFile } = useFileOperations()
  const { downloadFile } = useDownloadUrl()
  const { sharePublicly } = useShareFilePublicly()
  const { unsharePublicly } = useUnshareFilePublicly()

  // Modal hooks
  const alertModal = useAlertModal()
  const confirmModal = useConfirmModal()

  // Determine which files to display - search results or regular files
  const displayFiles = isSearchMode && searchState.hasSearched 
    ? searchState.results?.files || []
    : files
  
  const isLoading = isSearchMode ? searchState.isLoading : filesLoading

  // Close context menu on clicks outside or when navigating
  // Close context menu when folder changes
  useEffect(() => {
    closeContextMenu()
  }, [currentFolder])

  const handleUploadComplete = () => {
    refetchFiles()
    setShowUpload(false)
  }

  const handleFolderCreated = () => {
    refetchFolders()
  }

  const handleSearch = () => {
    setIsSearchMode(true)
    search()
  }

  const handleClearSearch = () => {
    setIsSearchMode(false)
    clearSearch()
  }

  const handleFolderNavigation = (folderId?: string, pathIndex?: number) => {
    // Clear search when navigating folders
    if (isSearchMode) {
      handleClearSearch()
    }
    // Always push the current folder to history if navigating to a different folder
    if (folderId !== currentFolder) {
      setFolderHistory((prev) => [...prev, currentFolder])
    }
    handleNavigateToFolder(folderId, pathIndex)
  }

  // Back navigation handler
  const handleBack = () => {
    setFolderHistory((prev) => {
      if (prev.length === 0) return prev
      const newHistory = [...prev]
      const lastFolder = newHistory.pop()
      setCurrentFolder(lastFolder)
      // Also update folderPath accordingly
      if (lastFolder) {
        const idx = folderPath.findIndex(f => f.id === lastFolder)
        if (idx !== -1) {
          setFolderPath(folderPath.slice(0, idx + 1))
        } else {
          setFolderPath([])
        }
      } else {
        setFolderPath([])
      }
      return newHistory
    })
  }

  const handleShowStatsModal = (fileId: string, filename: string) => {
    setStatsFileId(fileId)
    setStatsFileName(filename)
    setShowStatsModal(true)
  }

  const handleShowShareModal = (fileId: string, fileName: string) => {
    setFileToShare({ id: fileId, name: fileName })
    setShowShareModal(true)
  }

  const handleShareFile = async (username: string, permission: string) => {
    if (!fileToShare) return

    try {
      await shareFileByUsername({
        variables: { fileId: fileToShare.id, username, permission },
      })
      // Success - the modal will close automatically
    } catch (error) {
      console.error('Failed to share file:', error)
      throw error // Re-throw to let the modal handle the error display
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      await deleteFile({
        variables: { fileId },
      })
      refetchFiles()
    } catch (error) {
      console.error('Failed to delete file:', error)
      alertModal.showAlert('Error', 'Failed to delete file', 'error')
    }
  }

  const handleToggleVisibility = async (fileId: string, isPublic: boolean) => {
    try {
      if (isPublic) {
        // Share file publicly
        await sharePublicly(fileId)
      } else {
        // Unshare file publicly
        await unsharePublicly(fileId)
      }
      refetchFiles()
    } catch (error) {
      console.error('Failed to change file visibility:', error)
      alertModal.showAlert('Error', 'Failed to change file visibility', 'error')
    }
  }

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId, filename)
    } catch (error) {
      console.error('Failed to download file:', error)
      alertModal.showAlert('Error', 'Failed to download file', 'error')
    }
  }

  const handleMoveFile = async (fileId: string, folderId: string | null) => {
    try {
      await moveFile({
        variables: { fileId, folderId },
      })
      refetchFiles()
    } catch (error) {
      console.error('Failed to move file:', error)
      alertModal.showAlert('Error', `Failed to move file: ${(error as Error).message}`, 'error')
    }
  }

  const handleFolderClick = (folderId: string) => {
    const folder = folders.find((f: FolderType) => f.id === folderId)
    if (folder) {
      // Use handleFolderNavigation to properly update history
      handleFolderNavigation(folderId)
      setFolderPath(prev => [...prev, { id: folderId, name: folder.name }])
    }
  }

  const handleFolderDoubleClick = (folderId: string) => {
    // This is kept for compatibility, but we'll primarily use single click
    handleFolderClick(folderId)
  }

  const handleNavigateToFolder = (folderId: string | undefined, folderIndex?: number) => {
    setCurrentFolder(folderId)
    if (folderIndex !== undefined) {
      setFolderPath(prev => prev.slice(0, folderIndex + 1))
    } else {
      setFolderPath([])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    // Add visual feedback for valid drop target
    const target = e.currentTarget as HTMLElement
    target.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleFolderDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback when drag leaves
    const target = e.currentTarget as HTMLElement
    target.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling to parent container
    const fileId = e.dataTransfer.getData('text/plain')
    if (fileId) {
      handleMoveFile(fileId, folderId)
    }
  }

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fileId = e.dataTransfer.getData('text/plain')
    if (fileId) {
      handleMoveFile(fileId, null) // Move to root
    }
  }

  const handleShowMoveModal = (fileId: string) => {
    setFileToMove(fileId)
    setShowMoveModal(true)
  }

  const handleMoveToFolder = async (folderId: string | null) => {
    if (fileToMove) {
      await handleMoveFile(fileToMove, folderId)
      setFileToMove(null)
      setShowMoveModal(false)
    }
  }

  // Folder operations
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    const confirmMessage = `Are you sure you want to delete the folder "${folderName}"?\n\nNote: This will only work if the folder is empty. If the folder contains files or subfolders, please empty it first.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      await deleteFolder({
        variables: { folderId },
      })
      refetchFolders()
      // If we're currently in the deleted folder, navigate to parent
      if (currentFolder === folderId) {
        handleBack()
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
      
      // Check if the error is about folder not being empty
      const errorMessage = (error as Error).message || ''
      const hasGraphQLErrors = 'graphQLErrors' in (error as object)
      const graphQLErrors = hasGraphQLErrors ? (error as { graphQLErrors: Array<{ message: string }> }).graphQLErrors : []
      
      if (errorMessage.includes('folder is not empty') || 
          graphQLErrors.some(err => err.message?.includes('folder is not empty'))) {
        alertModal.showAlert(
          'Cannot Delete Folder', 
          `Cannot delete "${folderName}" because it contains files or subfolders.\n\nPlease empty the folder first by moving or deleting its contents.`,
          'warning'
        )
      } else {
        alertModal.showAlert('Error', `Failed to delete folder: ${errorMessage}`, 'error')
      }
    }
  }

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file', item: { id: string; name: string }) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
      type,
      item
    })
  }

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, show: false, item: null }))
  }

  const getFolderContextMenuItems = (folder: { id: string; name: string }) => [
    {
      id: 'open',
      label: 'Open',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: () => handleFolderClick(folder.id)
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleShowRenameModal(folder.id, folder.name)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDeleteFolder(folder.id, folder.name)
    }
  ]

  const getFileContextMenuItems = (file: { id: string; name: string }) => {
    const fileData = displayFiles.find((f: FileType) => f.id === file.id)
    return [
      {
        id: 'download',
        label: 'Download',
        icon: <Download className="w-4 h-4" />,
        onClick: () => handleDownloadFile(file.id, file.name)
      },
      {
        id: 'share',
        label: 'Share with User',
        icon: <Share className="w-4 h-4" />,
        onClick: () => handleShowShareModal(file.id, file.name)
      },
      {
        id: 'move',
        label: 'Move to Folder',
        icon: <Move className="w-4 h-4" />,
        onClick: () => handleShowMoveModal(file.id)
      },
      {
        id: 'stats',
        label: 'View Statistics',
        icon: <BarChart3 className="w-4 h-4" />,
        onClick: () => handleShowStatsModal(file.id, file.name)
      },
      {
        id: 'visibility',
        label: fileData?.isPublic ? 'Make Private' : 'Make Public',
        icon: <Share className="w-4 h-4" />,
        onClick: () => handleToggleVisibility(file.id, !fileData?.isPublic)
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => handleDeleteFile(file.id)
      }
    ]
  }

  const handleShowRenameModal = (folderId: string, folderName: string) => {
    setFolderToRename({ id: folderId, name: folderName })
    setShowRenameModal(true)
  }

  const handleRenameFolder = async (newName: string) => {
    if (!folderToRename) return

    try {
      await renameFolder({
        variables: { folderId: folderToRename.id, newName },
      })
      refetchFolders()
      // Update folder path if the renamed folder is in the current path
      setFolderPath(prev => prev.map(folder => 
        folder.id === folderToRename.id ? { ...folder, name: newName } : folder
      ))
    } catch (error) {
      console.error('Failed to rename folder:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={folderHistory.length === 0}
          className="mr-2 mb-2"
        >
          Back
        </Button>
        <Breadcrumb 
          items={[
            { label: "My Files", onClick: () => handleFolderNavigation(undefined) },
            ...folderPath.map((folder, index) => ({
              label: folder.name,
              onClick: () => handleFolderNavigation(folder.id, index)
            }))
          ]}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          filters={searchState.filters}
          onFiltersChange={updateFilters}
          onSearch={handleSearch}
          isLoading={searchState.isLoading}
          placeholder="Search files by name..."
        />
        
        {/* Search Results Info */}
        {isSearchMode && searchState.hasSearched && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              {searchState.error 
                ? `Error: ${searchState.error}`
                : `Found ${totalResults} file${totalResults !== 1 ? 's' : ''}`
              }
            </span>
            {isSearchMode && (
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button size="sm" className="flex items-center space-x-2" onClick={() => setShowCreateFolder(true)}>
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-transparent"
            onClick={() => setShowUpload((prev) => !prev)}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </Button>
        </div>

        <div className="hidden md:flex flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div className="mb-6">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Files and Folders */}
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6"
        onDragOver={handleDragOver}
        onDrop={handleRootDrop}
      >
        {/* Show empty state based on context */}
        {displayFiles.length === 0 && (isSearchMode ? true : folders.length === 0) ? (
          <div className="text-center py-12">
            {isSearchMode ? (
              // Search empty state
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchState.hasSearched ? 'No files found' : 'Start searching'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchState.hasSearched 
                    ? 'Try adjusting your search filters or search terms'
                    : 'Use the search bar above to find your files'
                  }
                </p>
                {searchState.hasSearched && (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Clear search
                  </Button>
                )}
              </>
            ) : (
              // Regular empty state
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                <p className="text-gray-500 mb-4">Upload your first file to get started</p>
                <Button className="flex items-center space-x-2" onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"
              }
              onContextMenu={(e) => {
                // Only prevent default context menu if clicking on empty areas
                if (e.target === e.currentTarget) {
                  e.preventDefault()
                }
              }}
            >
              {/* Show folders only when not in search mode */}
              {!isSearchMode && folders.map((folder: FolderType) => (
                <div
                  key={folder.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition-all duration-200 border-2 border-dashed border-transparent hover:border-blue-300 hover:shadow-md relative group"
                  onClick={() => handleFolderClick(folder.id)}
                  onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                  onContextMenu={(e) => handleContextMenu(e, 'folder', { id: folder.id, name: folder.name })}
                  onTouchEnd={(e) => {
                    // Handle touch events for mobile/touchpad
                    e.preventDefault()
                    handleFolderClick(folder.id)
                  }}
                  onDragOver={handleFolderDragOver}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => {
                    handleFolderDrop(e, folder.id)
                    // Remove visual feedback after drop
                    const target = e.currentTarget as HTMLElement
                    target.classList.remove('border-blue-500', 'bg-blue-50')
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFolderClick(folder.id)
                    }
                  }}
                  aria-label={`Open folder ${folder.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📁</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{folder.name}</h3>
                        <p className="text-xs text-gray-500">Folder • Click to open • Right-click for options</p>
                      </div>
                    </div>
                    
                    {/* Folder Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShowRenameModal(folder.id, folder.name)
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                        title="Rename folder"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFolder(folder.id, folder.name)
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-800"
                        title="Delete folder"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Render files (either search results or regular files) */}
              {displayFiles.map((file: FileType) => (
                <div
                  key={file.id}
                  onContextMenu={(e) => handleContextMenu(e, 'file', { id: file.id, name: file.filename })}
                >
                  <FileCard
                    file={file}
                    onShare={(fileId) => {
                      handleShowShareModal(fileId, file.filename)
                    }}
                    onDelete={handleDeleteFile}
                    onDownload={() => handleDownloadFile(file.id, file.filename)}
                    onToggleVisibility={handleToggleVisibility}
                    onMoveToFolder={handleShowMoveModal}
                    onShowStats={(fileId) => handleShowStatsModal(fileId, file.filename)}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button for Search Results */}
            {isSearchMode && canLoadMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={searchState.isLoading}
                  className="min-w-32"
                >
                  {searchState.isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleFolderCreated}
        parentId={currentFolder}
      />

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMoveToFolder={handleMoveToFolder}
        currentFolderId={currentFolder}
      />

      {/* File Download Statistics Modal */}
      <FileDownloadStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        fileId={statsFileId}
        fileName={statsFileName}
      />

      {/* Rename Folder Modal */}
      <RenameFolderModal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false)
          setFolderToRename(null)
        }}
        onRename={handleRenameFolder}
        currentName={folderToRename?.name || ""}
        folderId={folderToRename?.id || ""}
      />

      {/* Share by Username Modal */}
      <ShareByUsernameModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setFileToShare(null)
        }}
        onShare={handleShareFile}
        fileName={fileToShare?.name || ""}
      />

      {/* Alert and Confirm Modals */}
      {alertModal.alertData && (
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={alertModal.closeAlert}
          title={alertModal.alertData.title}
          message={alertModal.alertData.message}
          type={alertModal.alertData.type}
        />
      )}
      
      {confirmModal.confirmData && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.closeConfirm}
          title={confirmModal.confirmData.title}
          message={confirmModal.confirmData.message}
          onConfirm={confirmModal.confirmData.onConfirm}
          type={confirmModal.confirmData.type}
        />
      )}

      {/* Context Menu */}
      {contextMenu.show && contextMenu.item && (
        <ContextMenu
          items={contextMenu.type === 'folder' 
            ? getFolderContextMenuItems(contextMenu.item)
            : getFileContextMenuItems(contextMenu.item)
          }
          onClose={closeContextMenu}
          position={contextMenu.position}
        />
      )}
    </div>
  )
}
