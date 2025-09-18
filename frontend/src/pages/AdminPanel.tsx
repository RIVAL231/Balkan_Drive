import { Users, FileText, HardDrive, TrendingUp, Shield, Globe, Download, X } from "lucide-react"
import { useAdminStats, useAllUsers, useAllFiles } from "@/hooks/useStatistics"
import { formatFileSize } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StatCard from "@/components/ui/StatCard"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import AuditLogs from "@/components/audit/AuditLogs"
import { useState } from "react"

export default function AdminPanel() {
  const [expandedUsers, setExpandedUsers] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState(false)
  const { stats, loading } = useAdminStats()
  const { users } = useAllUsers()
  const { files } = useAllFiles()
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }



  return (
    <div>
      <Breadcrumb items={[{ label: "Admin Panel" }]} />

      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6" />} />

        <StatCard title="Total Files" value={stats.totalFiles} icon={<FileText className="w-6 h-6" />} />

        <StatCard
          title="Total Storage"
          value={formatFileSize(stats.totalStorage)}
          icon={<HardDrive className="w-6 h-6" />}
        />

        <StatCard title="Storage Savings" value={`${stats.totalSavings}%`} icon={<TrendingUp className="w-6 h-6" />} />

        <StatCard title="Public Files" value={stats.totalPublicFiles} icon={<Globe className="w-6 h-6" />} />

        <StatCard title="Total Downloads" value={stats.totalPublicDownloads} icon={<Download className="w-6 h-6" />} />
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>

          <div className="space-y-3">
            <button onClick={() => {setExpandedUsers(true)}} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">View All Users</div>
              <div className="text-sm text-gray-500">Manage user accounts and permissions</div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Storage Quotas</div>
              <div className="text-sm text-gray-500">Set and manage user storage limits</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">File Management</h3>
          </div>

          <div className="space-y-3">
            <button onClick={() => {setExpandedFiles(true)}} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">All Files</div>
              <div className="text-sm text-gray-500">Browse and manage all user files</div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">File Reports</div>
              <div className="text-sm text-gray-500">Generate usage and activity reports</div>
            </button>
          </div>
        </div>
      </div>

      {/* Public File Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Downloaded Files</h3>
          </div>

          {stats.topDownloadedFiles && stats.topDownloadedFiles.length > 0 ? (
            <div className="space-y-3">
              {stats.topDownloadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                    <p className="text-xs text-gray-500">by {file.owner.username}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{file.downloadCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No public files available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Downloads</h3>
          </div>

          {stats.recentDownloads && stats.recentDownloads.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentDownloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {download.downloadedBy ? download.downloadedBy.username : 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(download.downloadedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {download.ipAddress || 'Unknown IP'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Download className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent downloads</p>
            </div>
          )}
        </div>
      </div>

      {/* All Files Management */}
      {expandedFiles && (<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex  justify-between space-x-3">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">All Files</h3>
          </div>
          <div className="flex items-center justify-between">
          <button onClick={() => setExpandedFiles(false)} className="text-gray-400  hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          </div>
          </div>
        <div className="flex items-center justify-between mb-6">
        
          
          <div className="text-sm text-gray-500">
            Total: {files.length} files
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">File Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Uploader</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.length > 0 ? (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </p>
                          {file.folder && (
                            <p className="text-xs text-gray-500">
                              in {file.folder.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {file.filetype}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatFileSize(file.filesize)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {file.owner.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.owner.email}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          file.owner.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {file.owner.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        {file.isPublicShared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public
                          </span>
                        )}
                        {file.isPublic && !file.isPublicShared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Legacy Public
                          </span>
                        )}
                        {!file.isPublic && !file.isPublicShared && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Private
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No files found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* User Management */}
      {expandedUsers && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
             <button onClick={() => setExpandedUsers(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          
            {users.map((user) => (
              <div key={user.id} className="flex flex-col items-start space-y-1">
                <div>
                  <p className="font-medium text-gray-900"><span className="font-bold">Username:</span> {user.username}</p>
                  <p className="text-sm text-gray-500"><span className="font-bold">Email:</span> {user.email}</p>
                  <p className="text-sm text-gray-500"><span className="font-bold">Role:</span> {user.role}</p>
                </div>
              </div>
            ))}
           
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
        <AuditLogs isAdmin={true} />
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">API Status</p>
            <p className="text-sm text-green-600">Operational</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">Database</p>
            <p className="text-sm text-green-600">Healthy</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">Storage</p>
            <p className="text-sm text-green-600">Available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
