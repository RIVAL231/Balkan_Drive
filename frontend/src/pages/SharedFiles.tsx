import { Share2, Calendar, User } from "lucide-react"
import { useSharedFiles } from "@/hooks/useStatistics"
import { formatFileSize, formatRelativeTime, getFileIcon } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useDownloadUrl } from "@/hooks/useFiles"
import { useAuth } from "@/hooks/auth"
 

export default function SharedFiles() {
  const { downloadFile } = useDownloadUrl()
  const { sharedFiles, loading } = useSharedFiles()
  // console.log("All Shared Files:", sharedFiles)
  const currentUserId = useAuth().user?.id
  function filterFilesSharedToCurrentUser() {
    
   
    // console.log("Filtered Files:", sharedFiles.filter((sharedFile) => sharedFile.sharedTo?.id === currentUserId))
    return sharedFiles.filter((sharedFile) => sharedFile.sharedWith?.id === currentUserId)
  }
  const userSharedFiles = filterFilesSharedToCurrentUser()
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
  const handleDownload = (fileId: string, filename: string) => {
    // Implement file download logic here
    downloadFile(fileId, filename)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Shared Files" }]} />

      <div className="bg-white rounded-lg border border-gray-200">
        {sharedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
            <p className="text-gray-500">Files shared with you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sharedFiles.map((sharedFile) => (
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
    </div>
  )
}
