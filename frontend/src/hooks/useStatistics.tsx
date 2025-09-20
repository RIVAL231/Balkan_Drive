import { useQuery } from "@apollo/client/react"
import { gql } from "@apollo/client"

/**
 * Interface for user storage statistics data
 */
interface StorageStatsData {
  getUserStatistics: {
    /** Total storage used by user in bytes */
    totalUsed: number
    /** Original size of all files before deduplication in bytes */
    originalSize: number
    /** Storage savings from deduplication in bytes */
    savingsBytes: number
    /** Storage savings percentage (0-100) */
    savingsPercentage: number
    /** Total number of files owned by user */
    fileCount: number
    /** Number of files shared by this user */
    totalSharedFiles: number
    /** Number of shares received from other users */
    totalReceivedShares: number
  }
}

/**
 * Interface for admin statistics data
 */
interface AdminStatsData {
  getAdminStatistics: {
    /** Total number of registered users */
    totalUsers: number
    /** Total number of files in system */
    totalFiles: number
    /** Total storage used across all users in bytes */
    totalStorage: number
    /** Total storage savings from deduplication in bytes */
    totalSavings: number
    /** Number of publicly accessible files */
    totalPublicFiles: number
    /** Total number of public file downloads */
    totalPublicDownloads: number
    /** Top downloaded public files list */
    topDownloadedFiles: Array<{
      id: string
      filename: string
      downloadCount: number
      publicSharedAt: string
      owner: {
        id: string
        username: string
      }
    }>
    /** Recent download activity logs */
    recentDownloads: Array<{
      id: string
      downloadedAt: string
      ipAddress?: string
      downloadedBy?: {
        id: string
        username: string
      }
    }>
  }
}

/**
 * Interface for shared files data
 */
interface SharedFilesData {
  listSharedFiles: Array<{
    /** Unique share identifier */
    id: string
    /** Permission level (read, write, etc.) */
    permission: string
    /** File information */
    file: {
      id: string
      filename: string
      filetype: string
      filesize: number
      createdAt: string
    }
    /** User the file is shared with */
    sharedWith: {
      id: string
      username: string
    }
    sharedBy: {
      id: string
      username: string
    }
    expiresAt: string | null
  }>
}

interface AllFilesData {
  getAllFiles: Array<{
    id: string
    filename: string
    filetype: string
    filesize: number
    isPublic: boolean
    isPublicShared: boolean
    createdAt: string
    publicShareEnabledAt?: string
    /** File owner information */
    owner: {
      id: string
      username: string
      email: string
      role: string
    }
    /** User who enabled public sharing */
    publicShareEnabledBy?: {
      id: string
      username: string
      email: string
      role: string
    }
    /** Parent folder information */
    folder?: {
      id: string
      name: string
    }
  }>
}

/**
 * GraphQL query to fetch user storage statistics
 */
const STORAGE_STATS_QUERY = gql`
  query StorageStats {
    getUserStatistics {
      totalUsed
      originalSize
      savingsBytes
      savingsPercentage
      fileCount
      totalSharedFiles
      totalReceivedShares
    }
  }
`

/**
 * GraphQL query to fetch admin statistics (requires admin role)
 */
const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    getAdminStatistics {
      totalUsers
      totalFiles
      totalStorage
      totalSavings
      totalPublicFiles
      totalPublicDownloads
      topDownloadedFiles {
        id
        filename
        downloadCount
        publicSharedAt
        owner {
          id
          username
        }
      }
      recentDownloads {
        id
        downloadedAt
        ipAddress
        downloadedBy {
          id
          username
        }
      }
    }
  }
`

const LIST_SHARED_FILES_QUERY = gql`
  query ListSharedFiles {
    listSharedFiles {
      id
      file {
        id
        filename
        filetype
        filesize
        createdAt
      }
      sharedWith {
        id
        username
      }
      permission
      sharedBy {
        id
        username
      }
      expiresAt
    }
  }
`
const LIST_USERS_QUERY = gql`
  query ListAllUsers {
    listAllUsers {
      id
      username
      email
      role
    }
  }
`

const ALL_FILES_QUERY = gql`
  query GetAllFiles {
    getAllFiles {
      id
      filename
      filetype
      filesize
      isPublic
      isPublicShared
      createdAt
      publicShareEnabledAt
      owner {
        id
        username
        email
        role
      }
      publicShareEnabledBy {
        id
        username
        email
        role
      }
      folder {
        id
        name
      }
    }
  }
`

export function useStorageStats() {
  const { data, loading, error } = useQuery(STORAGE_STATS_QUERY)

  return {
    stats: (data as StorageStatsData)?.getUserStatistics || {
      totalUsed: 0,
      originalSize: 0,
      savingsBytes: 0,
      savingsPercentage: 0,
      fileCount: 0,
      totalSharedFiles: 0,
      totalReceivedShares: 0,
    },
    loading,
    error,
  }
}

/**
 * Custom hook to fetch all users (admin only)
 * 
 * Provides access to user list for admin operations.
 * 
 * @returns Object containing users array, loading state, and error
 * 
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { users, loading, error } = useAllUsers()
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading users</div>
 *   
 *   return (
 *     <div>
 *       {users.map(user => (
 *         <UserCard key={user.id} user={user} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAllUsers() {
  const { data, loading, error } = useQuery(LIST_USERS_QUERY)
  return {
    users: (data as { listAllUsers: Array<{ id: string; username: string; email: string; role: string }> })?.listAllUsers || [],
    loading,
    error,
  }
}

/**
 * Custom hook to fetch admin statistics
 * 
 * Provides comprehensive system statistics for admin dashboard.
 * Requires admin role to access.
 * 
 * @returns Object containing admin stats, loading state, and error
 * 
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { stats, loading, error } = useAdminStats()
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading statistics</div>
 *   
 *   return (
 *     <div>
 *       <StatCard title="Total Users" value={stats.totalUsers} />
 *       <StatCard title="Total Files" value={stats.totalFiles} />
 *       <StatCard title="Storage Used" value={formatFileSize(stats.totalStorage)} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useAdminStats() {
  const { data, loading, error } = useQuery(ADMIN_STATS_QUERY)

  return {
    stats: (data as AdminStatsData)?.getAdminStatistics || {
      totalUsers: 0,
      totalFiles: 0,
      totalStorage: 0,
      totalSavings: 0,
      totalPublicFiles: 0,
      totalPublicDownloads: 0,
      topDownloadedFiles: [],
      recentDownloads: [],
    },
    loading,
    error,
  }
}

/**
 * Custom hook to fetch files shared by the current user
 * 
 * Provides access to files that the user has shared with others.
 * 
 * @returns Object containing shared files array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function SharedFilesList() {
 *   const { sharedFiles, loading, error, refetch } = useSharedFiles()
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading shared files</div>
 *   
 *   return (
 *     <div>
 *       {sharedFiles.map(share => (
 *         <SharedFileCard key={share.id} share={share} onUnshare={refetch} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSharedFiles() {
  const { data, loading, error, refetch } = useQuery(LIST_SHARED_FILES_QUERY)

  return {
    sharedFiles: (data as SharedFilesData)?.listSharedFiles || [],
    loading,
    error,
    refetch,
  }
}

export function useAllFiles() {
  const { data, loading, error, refetch } = useQuery(ALL_FILES_QUERY)

  return {
    files: (data as AllFilesData)?.getAllFiles || [],
    loading,
    error,
    refetch,
  }
}
