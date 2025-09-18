import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

interface ShareByUsernameModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: (username: string, permission: string) => Promise<void>
  fileName: string
}

export default function ShareByUsernameModal({
  isOpen,
  onClose,
  onShare,
  fileName,
}: ShareByUsernameModalProps) {
  const [username, setUsername] = useState("")
  const [permission, setPermission] = useState("read")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError("Username is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await onShare(username.trim(), permission)
      onClose()
      setUsername("")
      setPermission("read")
    } catch (error) {
      setError("Failed to share file. Please check the username and try again.")
      console.error("Failed to share file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setUsername("")
    setPermission("read")
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Share File</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Sharing: <span className="font-medium">{fileName}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label htmlFor="permission" className="block text-sm font-medium text-gray-700 mb-2">
              Permission
            </label>
            <select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
            </select>
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
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? "Sharing..." : "Share"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}