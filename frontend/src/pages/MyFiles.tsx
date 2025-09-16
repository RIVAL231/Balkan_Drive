"use client"

import { useState } from "react"
import { Plus, Upload, Grid, List } from "lucide-react"
import { useFiles, useFolders, useFileOperations, useDownloadUrl } from "@/hooks/useFiles"
import Button from "@/components/ui/Button"
import Breadcrumb from "@/components/ui/Breadcrumb"
import FileCard from "@/components/files/FileCard"
import UploadZone from "@/components/files/UploadZone"
import CreateFolderModal from "@/components/files/CreateFolderModal"
import MoveToFolderModal from "@/components/files/MoveToFolderModal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface FileType {
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
//   const [showCreateFolder, setShowCreateFolder] = useState(false)
//   const [currentFolder, setCurrentFolder] = useState<string | undefined>()
//   const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([])

  const { files, loading: filesLoading, refetch: refetchFiles } = useFiles(currentFolder)
  const { folders, loading: foldersLoading, refetch: refetchFolders } = useFolders(currentFolder)
  const { deleteFile, changeVisibility, shareFileByUsername, moveFile } = useFileOperations()
  const { downloadFile } = useDownloadUrl()

  const handleUploadComplete = () => {
    refetchFiles()
    setShowUpload(false)
  }

  const handleFolderCreated = () => {
    refetchFolders()
  }

  const handleShareFile = async (fileId: string, username: string) => {
    try {
      await shareFileByUsername({
        variables: { fileId, username },
      })
      alert('File shared successfully!')
    } catch (error) {
      console.error('Failed to share file:', error)
      alert('Failed to share file')
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
      alert('Failed to delete file')
    }
  }

  const handleToggleVisibility = async (fileId: string, isPublic: boolean) => {
    try {
      await changeVisibility({
        variables: { fileId, isPublic },
      })
      refetchFiles()
    } catch (error) {
      console.error('Failed to change file visibility:', error)
      alert('Failed to change file visibility')
    }
  }

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId, filename)
    } catch (error) {
      console.error('Failed to download file:', error)
      alert('Failed to download file')
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
      alert('Failed to move file: ' + (error as Error).message)
    }
  }

  const handleFolderDoubleClick = (folderId: string) => {
    const folder = folders.find((f: FolderType) => f.id === folderId)
    if (folder) {
      setCurrentFolder(folderId)
      setFolderPath(prev => [...prev, { id: folderId, name: folder.name }])
    }
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

  if (filesLoading || foldersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb 
        items={[
          { label: "My Files", onClick: () => handleNavigateToFolder(undefined) },
          ...folderPath.map((folder, index) => ({
            label: folder.name,
            onClick: () => handleNavigateToFolder(folder.id, index)
          }))
        ]} 
      />

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
            onClick={() => setShowUpload(true)}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
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
        {files.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-500 mb-4">Upload your first file to get started</p>
            <Button className="flex items-center space-x-2" onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"
            }
          >
            {folders.map((folder: FolderType) => (
              <div
                key={folder.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors border-2 border-dashed border-transparent hover:border-blue-300"
                onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                onDragOver={handleFolderDragOver}
                onDragLeave={handleFolderDragLeave}
                onDrop={(e) => {
                  handleFolderDrop(e, folder.id)
                  // Remove visual feedback after drop
                  const target = e.currentTarget as HTMLElement
                  target.classList.remove('border-blue-500', 'bg-blue-50')
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📁</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{folder.name}</h3>
                    <p className="text-xs text-gray-500">Folder</p>
                  </div>
                </div>
              </div>
            ))}

            {files.map((file: FileType) => (
              <FileCard
                key={file.id}
                file={file}
                onShare={(fileId) => {
                  const username = prompt('Enter username to share with:')
                  if (username) {
                    handleShareFile(fileId, username)
                  }
                }}
                onDelete={handleDeleteFile}
                onToggleVisibility={handleToggleVisibility}
                onDownload={() => handleDownloadFile(file.id, file.filename)}
                onMoveToFolder={handleShowMoveModal}
              />
            ))}
          </div>
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
    </div>
  )
}
