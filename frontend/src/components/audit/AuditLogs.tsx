import { useState } from 'react'
import { Shield, Filter, User } from 'lucide-react'
import { useAuditLogs, getActionColor, getActionIcon, type AuditLog } from '@/hooks/useAuditLogs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

interface AuditLogsProps {
  isAdmin?: boolean
  userId?: string
}

export default function AuditLogs({ isAdmin = false, userId }: AuditLogsProps) {
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
    userId: userId,
    action: undefined as string | undefined,
    resourceType: undefined as string | undefined,
  })
  const [showFilters, setShowFilters] = useState(false)

  const { auditLogs, loading, error, refetch } = useAuditLogs(filters)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      offset: 0, // Reset pagination when filters change
    }))
  }

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }))
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'upload': return 'File Upload'
      case 'download': return 'File Download'
      case 'delete': return 'File Delete'
      case 'create_folder': return 'Folder Created'
      case 'delete_folder': return 'Folder Deleted'
      case 'share': return 'File Shared'
      default: return action
    }
  }

  if (loading && !auditLogs) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load audit logs</div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="flex items-center space-x-3">
      <Shield className="w-6 h-6 text-blue-600" />
      <h2 className="text-xl font-semibold text-gray-900">
        {isAdmin ? "System Audit Logs" : "My Activity Log"}
      </h2>
    </div>

    <Button
      variant="outline"
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center justify-center space-x-2 w-full sm:w-auto"
    >
      <Filter className="w-4 h-4" />
      <span>Filters</span>
    </Button>
  </div>

  {/* Filters */}
  {showFilters && (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="upload">Uploads</option>
            <option value="download">Downloads</option>
            <option value="delete">Deletions</option>
            <option value="create_folder">Folder Creation</option>
            <option value="delete_folder">Folder Deletion</option>
            <option value="share">File Sharing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.resourceType}
            onChange={(e) => handleFilterChange("resourceType", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="file">Files</option>
            <option value="folder">Folders</option>
          </select>
        </div>

        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by user ID"
              value={filters.userId || ""}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )}

  {/* Audit Logs List */}
  <div className="bg-white rounded-lg border border-gray-200">
    {!auditLogs?.logs.length ? (
      <div className="text-center py-12 text-gray-500">No audit logs found</div>
    ) : (
      <div className="divide-y divide-gray-200">
        {auditLogs.logs.map((log: AuditLog) => (
          <div key={log.id} className="p-4 sm:p-6 hover:bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start space-x-3 sm:space-x-4">
                {/* Action Icon */}
                <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                  <span className="text-lg">{getActionIcon(log.action)}</span>
                </div>

                {/* Log Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-1 mb-1">
                    <span className="font-medium text-gray-900">
                      {getActionLabel(log.action)}
                    </span>
                    {log.resourceName && (
                      <span className="text-gray-600 truncate">
                        • {log.resourceName}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    {isAdmin && log.user && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">
                          {log.user.username} ({log.user.email})
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Type: {log.resourceType}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>

                    {log.details && (
                      <div className="text-xs bg-gray-100 rounded p-2 mt-2 overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-words">
                          {log.details}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-gray-500 whitespace-nowrap sm:ml-4 order-first sm:order-none">
                {formatDateTime(log.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Load More */}
    {auditLogs?.hasMore && (
      <div className="p-4 border-t border-gray-200 text-center">
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <LoadingSpinner size="sm" /> : "Load More"}
        </Button>
      </div>
    )}

    {/* Stats */}
    {auditLogs && (
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {auditLogs.logs.length} of {auditLogs.totalCount} total logs
      </div>
    )}
  </div>
</div>

  )
}