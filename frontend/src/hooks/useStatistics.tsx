import { useQuery } from "@apollo/client/react"
import { gql } from "@apollo/client"

// Type definitions
interface StorageStatsData {
  storageStats: {
    totalUsed: number
    originalSize: number
    savingsBytes: number
    savingsPercentage: number
    fileCount: number
  }
}

interface AdminStatsData {
  adminStats: {
    totalUsers: number
    totalFiles: number
    totalStorage: number
    totalSavings: number
  }
}

interface SharedFilesData {
  listSharedFiles: Array<{
    id: string
    permission: string
    file: {
      id: string
      filename: string
    }
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

const STORAGE_STATS_QUERY = gql`
  query StorageStats {
    storageStats {
      totalUsed
      originalSize
      savingsBytes
      savingsPercentage
      fileCount
    }
  }
`

const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    adminStats {
      totalUsers
      totalFiles
      totalStorage
      totalSavings
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

export function useStorageStats() {
  const { data, loading, error } = useQuery(STORAGE_STATS_QUERY)

  return {
    stats: (data as StorageStatsData)?.storageStats || {
      totalUsed: 0,
      originalSize: 0,
      savingsBytes: 0,
      savingsPercentage: 0,
      fileCount: 0,
    },
    loading,
    error,
  }
}

export function useAdminStats() {
  const { data, loading, error } = useQuery(ADMIN_STATS_QUERY)

  return {
    stats: (data as AdminStatsData)?.adminStats || {
      totalUsers: 0,
      totalFiles: 0,
      totalStorage: 0,
      totalSavings: 0,
    },
    loading,
    error,
  }
}

export function useSharedFiles() {
  const { data, loading, error, refetch } = useQuery(LIST_SHARED_FILES_QUERY)

  return {
    sharedFiles: (data as SharedFilesData)?.listSharedFiles || [],
    loading,
    error,
    refetch,
  }
}
