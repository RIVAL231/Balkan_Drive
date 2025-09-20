import { useQuery } from '@apollo/client/react'
import { GET_AUDIT_LOGS, GET_USER_AUDIT_LOGS } from '@/lib/auditQueries'

export interface AuditLog {
  id: string
  user?: {
    id: string
    username: string
    email: string
  }
  action: string
  resourceType: string
  resourceId?: string
  resourceName?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditLogConnection {
  logs: AuditLog[]
  totalCount: number
  hasMore: boolean
}

interface AuditLogFilters {
  limit?: number
  offset?: number
  userId?: string
  action?: string
  resourceType?: string
}

interface UserAuditLogsData {
  getUserAuditLogs: AuditLogConnection;
}
interface AuditLogsData {
  getAuditLogs: AuditLogConnection;
}

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