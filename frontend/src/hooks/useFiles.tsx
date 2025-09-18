import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { gql } from "@apollo/client"

// Type definitions
interface FileData {
  listFiles: Array<{
    id: string
    filename: string
    filetype: string
    filesize: number
    isPublic: boolean
    isPublicShared: boolean
    publicShareEnabledAt?: string
    publicShareEnabledBy?: {
      id: string
      username: string
    }
    filepath: string
    filehash: string
    createdAt: string
    owner: {
      id: string
      username: string
    }
    folder: {
      id: string
      name: string
    } | null
  }>
}

interface FolderData {
  listFolders: Array<{
    id: string
    name: string
    owner: {
      id: string
      username: string
    }
    parent: {
      id: string
      name: string
    } | null
    createdAt: string
  }>
}

interface DownloadData {
  getDownloadUrl: string
}

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

const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($filename: String!, $filetype: String!, $filePath: String!, $filesize: Int!, $isPublic: Boolean!, $file: Upload!) {
    uploadFile(filename: $filename, filetype: $filetype, filePath: $filePath, filesize: $filesize, isPublic: $isPublic, file: $file) {
      uploadUrl
      uploadToken
    }
  }
`

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
const UNSHARE_FILE = gql`
    mutation UnshareFile($fileId: ID!, $userId: ID!) {
      unshareFile(fileId: $fileId, userId: $userId) 
    
    }
`

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

const GET_DOWNLOAD_URL_QUERY = gql`
  query GetDownloadUrl($fileId: ID!) {
    getDownloadUrl(fileId: $fileId)
  }
`

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
