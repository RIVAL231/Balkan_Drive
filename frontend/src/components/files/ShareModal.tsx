"use client"

import { useState } from "react"
import { X, Search, Calendar, Globe, LinkIcon } from "lucide-react"
import Button from "@/components/ui/Button"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  filename: string
}

export default function ShareModal({ isOpen, onClose, fileId, filename }: ShareModalProps) {
  const [searchUser, setSearchUser] = useState("")
  const [permission, setPermission] = useState("read")
  const [expirationDate, setExpirationDate] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [shareLink, setShareLink] = useState("")

  const generateShareLink = () => {
    const link = `${window.location.origin}/shared/${fileId}`
    setShareLink(link)
    navigator.clipboard.writeText(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Share "{filename}"</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Public Link */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Make public</span>
              </label>
              <Globe className="w-4 h-4 text-gray-400" />
            </div>

            {isPublic && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateShareLink}
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Generate Share Link</span>
                </Button>

                {shareLink && (
                  <div className="p-2 bg-gray-50 rounded border text-xs text-gray-600 break-all">{shareLink}</div>
                )}
              </div>
            )}
          </div>

          {/* Share with specific users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Share with users</label>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Permission level</span>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="read">Read only</option>
                  <option value="write">Read & Write</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Expiration date (optional)"
                />
              </div>
            </div>
          </div>

          {/* Current shares */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Currently shared with</h4>
            <div className="text-sm text-gray-500">No one has access to this file yet.</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>Share File</Button>
        </div>
      </div>
    </div>
  )
}
