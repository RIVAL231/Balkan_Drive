export interface SearchFilters {
  filename?: string
  mimeType?: string[]
  sizeMin?: number
  sizeMax?: number
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  uploaderName?: string
  folderId?: string
}

export interface SearchResult {
  files: Array<{
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
  totalCount: number
  hasMore: boolean
  facets: {
    mimeTypes: Array<{
      type: string
      count: number
      category: string
    }>
    uploaders: Array<{
      username: string
      userId: string
      count: number
    }>
    sizeBuckets: Array<{
      range: string
      min: number
      max?: number
      count: number
    }>
  }
}

export interface SortOption {
  field: 'filename' | 'filesize' | 'createdAt' | 'filetype'
  direction: 'asc' | 'desc'
}

export const COMMON_MIME_TYPES = [
  { label: 'Images', value: 'image/*', types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
  { label: 'Documents', value: 'document/*', types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { label: 'Videos', value: 'video/*', types: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'] },
  { label: 'Audio', value: 'audio/*', types: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'] },
  { label: 'Archives', value: 'archive/*', types: ['application/zip', 'application/x-tar', 'application/x-rar-compressed'] },
  { label: 'Text Files', value: 'text/*', types: ['text/plain', 'text/html', 'text/css', 'text/javascript'] },
] as const

export const FILE_SIZE_RANGES = [
  { label: 'Tiny (< 1 MB)', min: 0, max: 1024 * 1024 },
  { label: 'Small (1-10 MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: 'Medium (10-100 MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Large (100 MB - 1 GB)', min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024 },
  { label: 'Huge (> 1 GB)', min: 1024 * 1024 * 1024, max: undefined },
] as const