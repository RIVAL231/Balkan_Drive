import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

interface RenameFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onRename: (newName: string) => Promise<void>
  currentName: string
  folderId: string
}

export default function RenameFolderModal({
  isOpen,
  onClose,
  onRename,
  currentName,
}: RenameFolderModalProps) {
  const [folderName, setFolderName] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folderName.trim()) {
      setError("Folder name is required")
      return
    }

    if (folderName.trim() === currentName) {
      onClose()
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await onRename(folderName.trim())
      onClose()
      setFolderName("")
    } catch (error) {
      setError("Failed to rename folder")
      console.error("Failed to rename folder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFolderName(currentName)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Rename Folder</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>
            <Input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}