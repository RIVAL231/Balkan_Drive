"use client"

import { useState } from "react"
import { Plus, Upload, Grid3X3, List } from "lucide-react"
import { useFiles, useFolders } from "@/hooks/useFiles"
import Button from "@/components/ui/Button"
import Breadcrumb from "@/components/ui/Breadcrumb"
import FileCard from "@/components/files/FileCard"
import UploadZone from "@/components/files/UploadZone"
import CreateFolderModal from "@/components/files/CreateFolderModal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function MyFiles() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUpload, setShowUpload] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<string | undefined>()

  const { files, loading: filesLoading, refetch: refetchFiles } = useFiles(currentFolder)
  const { folders, loading: foldersLoading, refetch: refetchFolders } = useFolders(currentFolder)

  const handleUploadComplete = () => {
    refetchFiles()
    setShowUpload(false)
  }

  const handleFolderCreated = () => {
    refetchFolders()
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
      <Breadcrumb items={[{ label: "My Files" }]} />

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
            <Grid3X3 className="w-4 h-4" />
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
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

            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onShare={(fileId) => console.log("Share file:", fileId)}
                onDelete={(fileId) => console.log("Delete file:", fileId)}
                onToggleVisibility={(fileId, isPublic) => console.log("Toggle visibility:", fileId, isPublic)}
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
    </div>
  )
}
