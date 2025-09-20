"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { useFileOperations } from "@/hooks/useFiles"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import toast from "react-hot-toast"

/**
 * Props for the CreateFolderModal component
 */
interface CreateFolderModalProps {
  /** Whether the modal is currently open/visible */
  isOpen: boolean
  /** Callback function called when modal should be closed */
  onClose: () => void
  /** Callback function called when folder creation succeeds */
  onSuccess: () => void
  /** Optional parent folder ID where new folder will be created */
  parentId?: string
}

/**
 * CreateFolderModal component for creating new folders
 * 
 * Features:
 * - Simple form with folder name input
 * - Validation to ensure folder name is provided
 * - Loading states during folder creation
 * - Error handling with user feedback
 * - Integration with folder hierarchy (parent/child relationships)
 * - Responsive modal design
 * 
 * @example
 * ```tsx
 * <CreateFolderModal
 *   isOpen={showCreateModal}
 *   onClose={() => setShowCreateModal(false)}
 *   onSuccess={() => {
 *     setShowCreateModal(false)
 *     refetchFolders()
 *   }}
 *   parentId={currentFolderId}
 * />
 * ```
 */
export default function CreateFolderModal({ isOpen, onClose, onSuccess, parentId }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("")
  const [loading, setLoading] = useState(false)
  const { createFolder } = useFileOperations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!folderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    setLoading(true)
    try {
      await createFolder({
        variables: {
          name: folderName.trim(),
          parentId: parentId || null,
        },
      })

      toast.success("Folder created successfully")
      setFolderName("")
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create folder"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Folder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Folder
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
