import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

// GraphQL Queries and Mutations
const LIST_PUBLIC_FILES_QUERY = gql`
  query ListPublicFiles {
    listPublicFiles {
      id
      filename
      filetype
      filesize
      createdAt
      publicSharedAt
      downloadCount
      owner {
        id
        username
      }
    }
  }
`

const GET_FILE_DOWNLOAD_STATS_QUERY = gql`
  query GetFileDownloadStats($fileId: ID!) {
    getFileDownloadStats(fileId: $fileId) {
      totalDownloads
      downloads {
        id
        downloadedBy {
          id
          username
        }
        downloadedAt
        ipAddress
      }
    }
  }
`

const SHARE_FILE_PUBLICLY_MUTATION = gql`
  mutation ShareFilePublicly($fileId: ID!) {
    shareFilePublicly(fileId: $fileId)
  }
`

const UNSHARE_FILE_PUBLICLY_MUTATION = gql`
  mutation UnshareFilePublicly($fileId: ID!) {
    unshareFilePublicly(fileId: $fileId)
  }
`

const DOWNLOAD_PUBLIC_FILE_MUTATION = gql`
  mutation DownloadPublicFile($fileId: ID!) {
    downloadPublicFile(fileId: $fileId)
  }
`

// Types
export interface PublicFile {
  id: string
  filename: string
  filetype: string
  filesize: number
  createdAt: string
  publicSharedAt: string
  downloadCount: number
  owner: {
    id: string
    username: string
  }
}

export interface FileDownload {
  id: string
  downloadedBy?: {
    id: string
    username: string
  }
  downloadedAt: string
  ipAddress?: string
}

export interface FileDownloadStats {
  totalDownloads: number
  downloads: FileDownload[]
}

// Apollo Client response types
interface PublicFilesData {
  listPublicFiles: PublicFile[]
}

interface FileDownloadStatsData {
  getFileDownloadStats: FileDownloadStats
}

interface ShareFilePubliclyData {
  shareFilePublicly: boolean
}

interface UnshareFilePubliclyData {
  unshareFilePublicly: boolean
}

interface DownloadPublicFileData {
  downloadPublicFile: string
}

// Hook for listing public files
export const usePublicFiles = () => {
  const { data, loading, error, refetch } = useQuery<PublicFilesData>(LIST_PUBLIC_FILES_QUERY, {
    errorPolicy: 'all'
  })

  return {
    publicFiles: data?.listPublicFiles || [],
    loading,
    error,
    refetch
  }
}

// Hook for getting file download statistics
export const useFileDownloadStats = (fileId: string) => {
  const { data, loading, error, refetch } = useQuery<FileDownloadStatsData>(GET_FILE_DOWNLOAD_STATS_QUERY, {
    variables: { fileId },
    skip: !fileId,
    errorPolicy: 'all'
  })

  return {
    downloadStats: data?.getFileDownloadStats,
    loading,
    error,
    refetch
  }
}

// Hook for sharing files publicly
export const useShareFilePublicly = () => {
  const [shareFilePublicly, { loading, error }] = useMutation<ShareFilePubliclyData>(SHARE_FILE_PUBLICLY_MUTATION, {
    refetchQueries: ['ListFiles', 'ListPublicFiles'],
    errorPolicy: 'all'
  })

  const sharePublicly = async (fileId: string) => {
    try {
      const result = await shareFilePublicly({ variables: { fileId } })
      return result.data?.shareFilePublicly
    } catch (err) {
      console.error('Error sharing file publicly:', err)
      throw err
    }
  }

  return { sharePublicly, loading, error }
}

// Hook for unsharing files publicly
export const useUnshareFilePublicly = () => {
  const [unshareFilePublicly, { loading, error }] = useMutation<UnshareFilePubliclyData>(UNSHARE_FILE_PUBLICLY_MUTATION, {
    refetchQueries: ['ListFiles', 'ListPublicFiles'],
    errorPolicy: 'all'
  })

  const unsharePublicly = async (fileId: string) => {
    try {
      const result = await unshareFilePublicly({ variables: { fileId } })
      return result.data?.unshareFilePublicly
    } catch (err) {
      console.error('Error unsharing file publicly:', err)
      throw err
    }
  }

  return { unsharePublicly, loading, error }
}

// Hook for downloading public files
export const useDownloadPublicFile = () => {
  const [downloadPublicFile, { loading, error }] = useMutation<DownloadPublicFileData>(DOWNLOAD_PUBLIC_FILE_MUTATION, {
    refetchQueries: ['GetFileDownloadStats'],
    errorPolicy: 'all'
  })

  const downloadFile = async (fileId: string) => {
    try {
      const result = await downloadPublicFile({ variables: { fileId } })
      const downloadUrl = result.data?.downloadPublicFile
      
      if (downloadUrl) {
        // Open download URL in new tab
        window.open(downloadUrl, '_blank')
      }
      
      return downloadUrl
    } catch (err) {
      console.error('Error downloading public file:', err)
      throw err
    }
  }

  return { downloadFile, loading, error }
}