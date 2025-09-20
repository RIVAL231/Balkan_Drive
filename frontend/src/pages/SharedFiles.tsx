import { Share2, Calendar, User } from "lucide-react"
import { useSharedFiles } from "@/hooks/useStatistics"
import { formatFileSize, formatRelativeTime, getFileIcon } from "@/lib/utils"
import { useAlertModal } from "@/hooks/useModal"
import { AlertModal } from "@/components/ui/Modal"
import Breadcrumb from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useDownloadUrl } from "@/hooks/useFiles"
import { useAuth } from "@/hooks/auth"
import { useFileOperations } from "@/hooks/useFiles"

/**
 * SharedFiles page component for managing files shared with and by the current user
 * 
 * Features:
 * - View files shared with the current user by others
 * - View files the current user has shared with others
 * - Download shared files with permission checking
 * - Unshare files (remove sharing permissions)
 * - File metadata display with sharing information
 * - Loading states and error handling
 * - Empty state handling when no shared files exist
 * - Real-time updates when sharing changes
 * - Permission-based actions and visibility
 * - Responsive design for mobile access
 * 
 * @example
 * ```tsx
 * // Used as a route component
 * <Route path="/shared" component={SharedFiles} />
 * 
 * // Displays two categories of shared files:
 * // 1. Files shared TO the user (received shares)
 * // 2. Files shared BY the user (given shares)
 * // with appropriate actions for each category
 * ```
 */
export default function SharedFiles() {
  const { unshareFile } = useFileOperations()
  const { downloadFile } = useDownloadUrl()
  const { sharedFiles, loading, refetch } = useSharedFiles()
  // console.log("All Shared Files:", sharedFiles)
  const currentUserId = useAuth().user?.id
  
  // Modal hook
  const alertModal = useAlertModal()

  function filterFilesSharedToCurrentUser() {
    
   // console.log("Filtered Files:", sharedFiles.filter((sharedFile) => sharedFile.sharedTo?.id === currentUserId))
    return sharedFiles.filter((sharedFile) => sharedFile.sharedWith?.id === currentUserId)
  }
  const filterFilesSharedByCurrentUser = () => {
    return sharedFiles.filter((sharedFile) => sharedFile.sharedBy?.id === currentUserId)
  }
  const userSharedFiles = filterFilesSharedToCurrentUser()
  const currentUserSharedFiles = filterFilesSharedByCurrentUser()
  console.log("User Shared Files:", userSharedFiles)
  if (userSharedFiles.length === 0 && !loading) {
    return (
      <div>
        <Breadcrumb items={[{ label: "Shared Files" }]} />
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
          <p className="text-gray-500">Files shared with you will appear here</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
   
  const handleUnshareFile = async (fileId: string) => {
    if (!currentUserId) return
    
    try {
      await unshareFile({ variables: { fileId, userId: currentUserId } })
      // Refresh the shared files list after successful unshare
      await refetch()
    } catch (error) {
      console.error('Failed to unshare file:', error)
      alertModal.showAlert('Error', 'Failed to unshare file', 'error')
    }
  }

  const handleDownload = (fileId: string, filename: string) => {
    // Implement file download logic here
    downloadFile(fileId, filename)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Shared Files" }]} />

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 p-6">Files Shared With Me</h1>
        </div>
        {sharedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
            <p className="text-gray-500">Files shared with you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 ">
            {userSharedFiles.map((sharedFile) => (
              <div key={sharedFile.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getFileIcon(sharedFile.file.filetype)}</div>

                    <div>
                      <h3 className="font-medium text-gray-900">{sharedFile.file.filename}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(sharedFile.file.filesize)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(sharedFile.file.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <User className="w-4 h-4" />
                      <span>Shared by {sharedFile.sharedBy.username}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                       <span onClick={() => handleDownload(sharedFile.file.id, sharedFile.file.filename)} className="px-2 hover:cursor-pointer py-1 bg-red-100 text-red-800 font-bold rounded-md text-xs">
                         Download
                       </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {sharedFile.permission}
                      </span>
                      
                      {sharedFile.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Expires {formatRelativeTime(sharedFile.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {currentUserSharedFiles.length > 0 && (<div className="bg-white rounded-lg border border-gray-200 mt-8">
       <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 p-6">Files Shared By Me</h1>
        </div>
        {sharedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
            <p className="text-gray-500">Files shared by you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentUserSharedFiles.map((sharedFile) => (
              <div key={sharedFile.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getFileIcon(sharedFile.file.filetype)}</div>

                    <div>
                      <h3 className="font-medium text-gray-900">{sharedFile.file.filename}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(sharedFile.file.filesize)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(sharedFile.file.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col  items-end gap-y-3">
                    <div className="flex items-start">
                      <button className="text-sm rounded-md p-2 bg-gray-100 text-gray-500 hover:bg-gray-300" onClick={() => handleUnshareFile(sharedFile.file.id)}>Unshare</button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <User className="w-4 h-4" />
                      <span>Shared by {sharedFile.sharedBy.username}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                       <span onClick={() => handleDownload(sharedFile.file.id, sharedFile.file.filename)} className="px-2 hover:cursor-pointer py-1 bg-red-100 text-red-800 font-bold rounded-md text-xs">
                         Download
                       </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {sharedFile.permission}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Shared with {sharedFile.sharedWith.username}
                      </span>
                      
                      {sharedFile.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Expires {formatRelativeTime(sharedFile.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)}

      {/* Alert Modal */}
      {alertModal.alertData && (
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={alertModal.closeAlert}
          title={alertModal.alertData.title}
          message={alertModal.alertData.message}
          type={alertModal.alertData.type}
        />
      )}
    </div>
    
  )
}
