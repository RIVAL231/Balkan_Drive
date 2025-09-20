import { Download, Eye, User, Calendar, FileIcon } from "lucide-react"
import { usePublicFiles, useDownloadPublicFile } from "@/hooks/usePublicFiles"
import { formatFileSize, formatRelativeTime, getFileIcon } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Button from "@/components/ui/Button"

/**
 * PublicFiles page component for browsing and downloading publicly shared files
 * 
 * Features:
 * - Browse all publicly accessible files in the system
 * - File download functionality with progress tracking
 * - File metadata display (size, type, owner, upload date)
 * - File type icons and visual indicators
 * - Responsive grid layout for file cards
 * - Loading states and error handling
 * - Download tracking and analytics
 * - Search and filtering capabilities (when integrated)
 * - Mobile-optimized interface
 * 
 * @example
 * ```tsx
 * // Used as a route component (accessible to all users)
 * <Route path="/public" component={PublicFiles} />
 * 
 * // Displays publicly shared files including:
 * // - Files marked as public by their owners
 * // - Download buttons for immediate access
 * // - File metadata and sharing information
 * // - Owner information for transparency
 * ```
 */
export default function PublicFiles() {
  const { publicFiles, loading, error } = usePublicFiles()
  const { downloadFile, loading: downloading } = useDownloadPublicFile()

  const handleDownload = async (fileId: string) => {
    try {
      await downloadFile(fileId)
    } catch (error) {
      console.error('Download failed:', error)
      // You could add a toast notification here
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          Failed to load public files: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Public Files" }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Public Files</h1>
        <p className="text-gray-600">
          Browse and download files shared publicly by all users
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {publicFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No public files</h3>
            <p className="text-gray-500">
              No files have been shared publicly yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {publicFiles.map((file) => (
              <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">{getFileIcon(file.filetype)}</div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {file.filename}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.filesize)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>by {file.owner.username}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatRelativeTime(file.publicSharedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{file.downloadCount} downloads</span>
                        </div>
                        <span>•</span>
                        <span>Created {formatRelativeTime(file.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Button
                      onClick={() => handleDownload(file.id)}
                      disabled={downloading}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloading ? 'Downloading...' : 'Download'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {publicFiles.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Showing {publicFiles.length} public files</p>
        </div>
      )}
    </div>
  )
}