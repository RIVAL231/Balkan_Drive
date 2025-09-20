import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { gql } from "@apollo/client"

/**
 * Interface for file data structure returned from GraphQL queries
 */
interface FileData {
  listFiles: Array<{
    /** Unique file identifier */
    id: string
    /** Original filename with extension */
    filename: string
    /** MIME type of the file */
    filetype: string
    /** File size in bytes */
    filesize: number
    /** Whether file is publicly accessible */
    isPublic: boolean
    /** Whether file has public sharing enabled */
    isPublicShared: boolean
    /** Timestamp when public sharing was enabled */
    publicShareEnabledAt?: string
    /** User who enabled public sharing */
    publicShareEnabledBy?: {
      id: string
      username: string
    }
    /** File path in storage system */
    filepath: string
    /** SHA-256 hash of file content for deduplication */
    filehash: string
    /** File creation timestamp */
    createdAt: string
    /** File owner information */
    owner: {
      id: string
      username: string
    }
    /** Parent folder information, null if in root */
    folder: {
      id: string
      name: string
    } | null
  }>
}

/**
 * Interface for folder data structure returned from GraphQL queries
 */
interface FolderData {
  listFolders: Array<{
    /** Unique folder identifier */
    id: string
    /** Folder name */
    name: string
    /** Folder owner information */
    owner: {
      id: string
      username: string
    }
    /** Parent folder information, null if root folder */
    parent: {
      id: string
      name: string
    } | null
    /** Folder creation timestamp */
    createdAt: string
  }>
}

/**
 * Interface for download URL response
 */
interface DownloadData {
  /** Presigned download URL for file access */
  getDownloadUrl: string
}

/**
 * GraphQL query to list files in a specific folder
 */
const LIST_FILES_QUERY = gql`
  query ListFiles($folderId: ID) {
    listFiles(folderId: $folderId) {
      id
      filename
      filetype
      filesize
      isPublic
      isPublicShared
      publicShareEnabledAt
      publicShareEnabledBy {
        id
        username
      }
      filepath
      filehash
      createdAt
      owner {
        id
        username
      }
      folder {
        id
        name
      }
    }
  }
`

/**
 * GraphQL mutation to initiate file upload process
 */
const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($filename: String!, $filetype: String!, $filePath: String!, $filesize: Int!, $isPublic: Boolean!, $file: Upload!) {
    uploadFile(filename: $filename, filetype: $filetype, filePath: $filePath, filesize: $filesize, isPublic: $isPublic, file: $file) {
      uploadUrl
      uploadToken
    }
  }
`

/**
 * GraphQL mutation to complete file upload after S3 upload
 */
const COMPLETE_UPLOAD_MUTATION = gql`
  mutation CompleteUpload($uploadToken: String!) {
    completeUpload(uploadToken: $uploadToken) {
      id
      filename
      filetype
      filesize
      isPublic
      filepath
      filehash
      createdAt
      owner {
        id
        username
      }
    }
  }
`

/**
 * GraphQL query to list folders in a specific parent folder
 */
const LIST_FOLDERS_QUERY = gql`
  query ListFolders($parentId: ID) {
    listFolders(parentId: $parentId) {
      id
      name
      owner {
        id
        username
      }
      parent {
        id
        name
      }
      createdAt
    }
  }
`

const CREATE_FOLDER_MUTATION = gql`
  mutation CreateFolder($name: String!, $parentId: ID) {
    createFolder(name: $name, parentId: $parentId) {
      id
      name
      owner {
        id
        username
      }
      parent {
        id
        name
      }
      createdAt
    }
  }
`

const DELETE_FILE_MUTATION = gql`
  mutation DeleteFile($fileId: ID!) {
    deleteFile(fileId: $fileId)
  }
`

const DELETE_FOLDER_MUTATION = gql`
  mutation DeleteFolder($folderId: ID!) {
    deleteFolder(folderId: $folderId)
  }
`

const RENAME_FOLDER_MUTATION = gql`
  mutation RenameFolder($folderId: ID!, $newName: String!) {
    renameFolder(folderId: $folderId, newName: $newName) {
      id
      name
      createdAt
    }
  }
`
/**
 * GraphQL mutation to remove file sharing permissions for a specific user
 */
const UNSHARE_FILE = gql`
    mutation UnshareFile($fileId: ID!, $userId: ID!) {
      unshareFile(fileId: $fileId, userId: $userId) 
    
    }
`

/**
 * GraphQL mutation to change file visibility (public/private)
 */
const CHANGE_VISIBILITY_MUTATION = gql`
  mutation ChangeVisibility($fileId: ID!, $isPublic: Boolean!) {
    changeVisibility(fileId: $fileId, isPublic: $isPublic) {
      id
      filename
      filetype
      filesize
      isPublic
      filepath
      filehash
      createdAt
      owner {
        id
        username
      }
    }
  }
`

/**
 * GraphQL query to get a presigned download URL for a file
 */
const GET_DOWNLOAD_URL_QUERY = gql`
  query GetDownloadUrl($fileId: ID!) {
    getDownloadUrl(fileId: $fileId)
  }
`

/**
 * GraphQL mutation to share file with another user by username
 */
const SHARE_FILE_BY_USERNAME_MUTATION = gql`
  mutation ShareFileByUsername($fileId: ID!, $username: String!, $permission: String!) {
    shareFileByUsername(fileId: $fileId, username: $username, permission: $permission) {
      id
      permission
      file {
        id
        filename
      }
      sharedWith {
        id
        username
      }
      sharedBy {
        id
        username
      }
    }
  }
`

const MOVE_FILE_MUTATION = gql`
  mutation MoveFile($fileId: ID!, $folderId: ID) {
    moveFile(fileId: $fileId, folderId: $folderId) {
      id
      filename
      filetype
      filesize
      isPublic
      createdAt
      folder {
        id
        name
      }
      owner {
        id
        username
      }
    }
  }
`

/**
 * Custom hook for managing files in a specific folder
 * 
 * Provides access to files list with loading states and refetch functionality.
 * 
 * @param folderId - Optional folder ID to filter files by
 * @returns Object containing files array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function FileList({ folderId }: { folderId?: string }) {
 *   const { files, loading, error, refetch } = useFiles(folderId)
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading files</div>
 *   
 *   return (
 *     <div>
 *       {files.map(file => (
 *         <FileCard key={file.id} file={file} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFiles(folderId?: string) {
  const { data, loading, error, refetch } = useQuery(LIST_FILES_QUERY, {
    variables: { folderId },
  })

  return {
    files: (data as FileData)?.listFiles || [],
    loading,
    error,
    refetch,
  }
}

/**
 * Custom hook for managing folders in a specific parent folder
 * 
 * Provides access to folders list with loading states and refetch functionality.
 * 
 * @param parentId - Optional parent folder ID to filter folders by
 * @returns Object containing folders array, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function FolderList({ parentId }: { parentId?: string }) {
 *   const { folders, loading, error, refetch } = useFolders(parentId)
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (error) return <div>Error loading folders</div>
 *   
 *   return (
 *     <div>
 *       {folders.map(folder => (
 *         <FolderCard key={folder.id} folder={folder} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFolders(parentId?: string) {
  const { data, loading, error, refetch } = useQuery(LIST_FOLDERS_QUERY, {
    variables: { parentId },
  })

  return {
    folders: (data as FolderData)?.listFolders || [],
    loading,
    error,
    refetch,
  }
}

/**
 * Custom hook for file operations (upload, share, visibility changes, etc.)
 * 
 * Provides mutation functions for various file operations with proper error handling.
 * 
 * @returns Object containing mutation functions for file operations
 * 
 * @example
 * ```tsx
 * function FileManager() {
 *   const { unshareFile, uploadFile, completeUpload, changeVisibility, shareFileByUsername } = useFileOperations()
 *   
 *   const handleUpload = async (file: File) => {
 *     try {
 *       const uploadResult = await uploadFile({
 *         variables: {
 *           filename: file.name,
 *           filetype: file.type,
 *           filesize: file.size,
 *           isPublic: false,
 *           file
 *         }
 *       })
 *       
 *       // Upload to S3 here...
 *       
 *       await completeUpload({
 *         variables: { uploadToken: uploadResult.data.uploadFile.uploadToken }
 *       })
 *     } catch (error) {
 *       console.error('Upload failed:', error)
 *     }
 *   }
 * }
 * ```
 */
export function useFileOperations() {
  const [unshareFile] = useMutation(UNSHARE_FILE)
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION)
  const [completeUpload] = useMutation(COMPLETE_UPLOAD_MUTATION)
  const [createFolder] = useMutation(CREATE_FOLDER_MUTATION)
  const [deleteFile] = useMutation(DELETE_FILE_MUTATION)
  const [deleteFolder] = useMutation(DELETE_FOLDER_MUTATION)
  const [renameFolder] = useMutation(RENAME_FOLDER_MUTATION)
  const [changeVisibility] = useMutation(CHANGE_VISIBILITY_MUTATION)
  const [shareFileByUsername] = useMutation(SHARE_FILE_BY_USERNAME_MUTATION)
  const [moveFile] = useMutation(MOVE_FILE_MUTATION)

  return {
    uploadFile,
    completeUpload,
    createFolder,
    deleteFile,
    deleteFolder,
    renameFolder,
    changeVisibility,
    shareFileByUsername,
    moveFile,
    unshareFile,
  }
}

export function useDownloadUrl() {
  const [getDownloadUrl] = useLazyQuery(GET_DOWNLOAD_URL_QUERY)
  
  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const { data } = await getDownloadUrl({ variables: { fileId } })
      if ((data as DownloadData)?.getDownloadUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a')
        link.href = (data as DownloadData).getDownloadUrl
        link.target = "_blank" // Opens in a new tab/window
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Failed to download file:', error)
      throw error
    }
  }

  return { downloadFile }
}
