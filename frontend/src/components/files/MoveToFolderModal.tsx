"use client"

import { useState, useEffect } from "react"
import { X, Folder } from "lucide-react"
import Button from "@/components/ui/Button"
import { useFolders } from "@/hooks/useFiles"

interface MoveToFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onMoveToFolder: (folderId: string | null) => void
  currentFolderId?: string
}

export default function MoveToFolderModal({ 
  isOpen, 
  onClose, 
  onMoveToFolder, 
  currentFolderId 
}: MoveToFolderModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const { folders, loading } = useFolders(undefined) // Get root folders

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    onMoveToFolder(selectedFolderId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Move to Folder</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Root folder option */}
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFolderId === null
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <div className="flex items-center space-x-3">
                <Folder className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Root Folder</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading folders...</div>
            ) : (
              folders
                .filter((folder: { id: string; name: string }) => folder.id !== currentFolderId) // Don't show current folder
                .map((folder: { id: string; name: string }) => (
                  <div
                    key={folder.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFolderId === folder.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Folder className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{folder.name}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Move Here
          </Button>
        </div>
      </div>
    </div>
  )
}