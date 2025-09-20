import { useQuery } from '@apollo/client/react'
import { GET_AUDIT_LOGS, GET_USER_AUDIT_LOGS } from '@/lib/auditQueries'

/**
 * Interface for audit log entries
 */
export interface AuditLog {
  /** Unique identifier for the audit log entry */
  id: string
  /** User who performed the action (null for system actions) */
  user?: {
    id: string
    username: string
    email: string
  }
  /** Type of action performed (login, upload, delete, etc.) */
  action: string
  /** Type of resource affected (file, user, folder, etc.) */
  resourceType: string
  /** ID of the affected resource */
  resourceId?: string
  /** Human-readable name of the affected resource */
  resourceName?: string
  /** Additional details about the action */
  details?: string
  /** IP address from which the action was performed */
  ipAddress?: string
  /** Browser/client user agent string */
  userAgent?: string
  /** Timestamp when the action occurred */
  createdAt: string
}

/**
 * Interface for paginated audit log responses
 */
export interface AuditLogConnection {
  /** Array of audit log entries */
  logs: AuditLog[]
  /** Total number of logs matching the criteria */
  totalCount: number
  /** Whether more logs are available beyond this page */
  hasMore: boolean
}

/**
 * Interface for filtering audit logs
 */
interface AuditLogFilters {
  /** Maximum number of logs to return */
  limit?: number
  /** Number of logs to skip (for pagination) */
  offset?: number
  /** Filter by specific user ID */
  userId?: string
  /** Filter by specific action type */
  action?: string
  /** Filter by specific resource type */
  resourceType?: string
}

/**
 * Interface for user-specific audit logs data
 */
interface UserAuditLogsData {
  getUserAuditLogs: AuditLogConnection;
}

/**
 * Interface for admin audit logs data (all users)
 */
interface AuditLogsData {
  getAuditLogs: AuditLogConnection;
}

/**
 * Custom hook for fetching audit logs (admin access)
 * 
 * Provides access to system-wide audit logs for administrators.
 * Supports filtering and pagination for efficient data loading.
 * 
 * @param filters - Optional filters for limiting and organizing audit logs
 * @returns Object containing audit logs, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function AdminAuditLogs() {
 *   const { auditLogs, loading, error, refetch } = useAuditLogs({
 *     action: 'login',
 *     limit: 100
 *   })
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading logs</div>
 *   
 *   return (
 *     <div>
 *       {auditLogs.logs.map(log => (
 *         <AuditLogEntry key={log.id} log={log} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const { data, loading, error, refetch } = useQuery<AuditLogsData>(GET_AUDIT_LOGS, {
    variables: {
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      userId: filters.userId || null,
      action: filters.action || null,
      resourceType: filters.resourceType || null,
    },
    fetchPolicy: 'cache-and-network',
  })

  return {
    auditLogs: data?.getAuditLogs || undefined,
    loading,
    error,
    refetch,
  }
}



export const useUserAuditLogs = (limit = 50, offset = 0) => {
  const { data, loading, error, refetch } = useQuery<UserAuditLogsData>(GET_USER_AUDIT_LOGS, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
  })

  return {
    auditLogs: data?.getUserAuditLogs || undefined,
    loading,
    error,
    refetch,
  }
}

export const getActionColor = (action: string): string => {
  switch (action) {
    case 'upload':
      return 'text-green-600 bg-green-50'
    case 'download':
      return 'text-blue-600 bg-blue-50'
    case 'delete':
      return 'text-red-600 bg-red-50'
    case 'create_folder':
      return 'text-purple-600 bg-purple-50'
    case 'delete_folder':
      return 'text-orange-600 bg-orange-50'
    case 'share':
      return 'text-indigo-600 bg-indigo-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getActionIcon = (action: string): string => {
  switch (action) {
    case 'upload':
      return '📤'
    case 'download':
      return '📥'
    case 'delete':
      return '🗑️'
    case 'create_folder':
      return '📁'
    case 'delete_folder':
      return '🗂️'
    case 'share':
      return '🔗'
    default:
      return '📋'
  }
}