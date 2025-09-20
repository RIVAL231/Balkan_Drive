import { X, Download, User, Calendar, Globe } from "lucide-react"
import { useFileDownloadStats } from "@/hooks/usePublicFiles"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

/**
 * Props for the FileDownloadStatsModal component
 */
interface FileDownloadStatsModalProps {
  /** Whether the modal is currently open/visible */
  isOpen: boolean
  /** Callback function called when modal should be closed */
  onClose: () => void
  /** ID of the file to show download statistics for */
  fileId: string
  /** Display name of the file */
  fileName: string
}

/**
 * FileDownloadStatsModal component for displaying file download analytics
 * 
 * Features:
 * - Comprehensive download statistics and metrics
 * - Download activity timeline with user information
 * - Unique downloader count and geographic data
 * - Loading states and error handling
 * - Responsive table design for mobile devices
 * - Date/time formatting for download timestamps
 * - Anonymous download tracking
 * 
 * @example
 * ```tsx
 * <FileDownloadStatsModal
 *   isOpen={showStatsModal}
 *   onClose={() => setShowStatsModal(false)}
 *   fileId={selectedFile.id}
 *   fileName={selectedFile.filename}
 * />
 * ```
 */
export default function FileDownloadStatsModal({
  isOpen,
  onClose,
  fileId,
  fileName
}: FileDownloadStatsModalProps) {
  const { downloadStats, loading, error } = useFileDownloadStats(fileId)

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const getUniqueDownloaders = () => {
    if (!downloadStats?.downloads) return 0
    const uniqueUsers = new Set(
      downloadStats.downloads.map(d => d.downloadedBy?.id || 'anonymous')
    )
    return uniqueUsers.size
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Download Statistics</h2>
              <p className="text-sm text-gray-600">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Failed to load download statistics</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Downloads</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {downloadStats?.totalDownloads || 0}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Unique Users</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {getUniqueDownloaders()}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Recent Activity</span>
                  </div>
                  <p className="text-sm font-medium text-purple-900 mt-1">
                    {downloadStats?.downloads && downloadStats.downloads.length > 0
                      ? `Latest: ${formatDate(downloadStats.downloads[0].downloadedAt)}`
                      : 'No downloads yet'
                    }
                  </p>
                </div>
              </div>

              {/* Downloads List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Download History</h3>
                
                {!downloadStats?.downloads || downloadStats.downloads.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No downloads recorded yet</p>
                    <p className="text-sm text-gray-400">
                      Share this file publicly to start tracking downloads
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Downloaded At
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP Address
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {downloadStats.downloads.map((download) => (
                            <tr key={download.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {download.downloadedBy?.username || 'Anonymous'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(download.downloadedAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {download.ipAddress || 'Unknown'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}