import { useQuery } from "@apollo/client/react"
import { gql } from "@apollo/client"

// Type definitions
interface StorageStatsData {
  getUserStatistics: {
    totalUsed: number
    originalSize: number
    savingsBytes: number
    savingsPercentage: number
    fileCount: number
    totalSharedFiles: number
    totalReceivedShares: number
  }
}

interface AdminStatsData {
  getAdminStatistics: {
    totalUsers: number
    totalFiles: number
    totalStorage: number
    totalSavings: number
    totalPublicFiles: number
    totalPublicDownloads: number
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

interface SharedFilesData {
  listSharedFiles: Array<{
    id: string
    permission: string
    file: {
      id: string
      filename: string
      filetype: string
      filesize: number
      createdAt: string
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
    owner: {
      id: string
      username: string
      email: string
      role: string
    }
    publicShareEnabledBy?: {
      id: string
      username: string
      email: string
      role: string
    }
    folder?: {
      id: string
      name: string
    }
  }>
}

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

export function useAllUsers() {
  const { data, loading, error } = useQuery(LIST_USERS_QUERY)
  return {
    users: (data as { listAllUsers: Array<{ id: string; username: string; email: string; role: string }> })?.listAllUsers || [],
    loading,
    error,
  }
}

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
