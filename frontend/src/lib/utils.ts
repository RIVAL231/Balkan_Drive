import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getFileIcon(filetype: string): string {
  if (filetype.startsWith("image/")) return "🖼️"
  if (filetype.startsWith("video/")) return "📹"
  if (filetype.startsWith("audio/")) return "🎵"
  if (filetype.includes("pdf")) return "📄"
  if (filetype.includes("word") || filetype.includes("document")) return "📝"
  if (filetype.includes("excel") || filetype.includes("spreadsheet")) return "📊"
  if (filetype.includes("powerpoint") || filetype.includes("presentation")) return "📋"
  if (filetype.includes("zip") || filetype.includes("archive")) return "📦"
  return "📄"
}

// MIME type validation utility
export async function validateFileMimeType(file: File): Promise<{ 
  isValid: boolean; 
  detectedType?: string; 
  error?: string 
}> {
  try {
    // Read the first few bytes of the file to check magic numbers
    const arrayBuffer = await file.slice(0, 4096).arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    const detectedType = detectMimeTypeFromBytes(uint8Array)
    const declaredType = file.type.toLowerCase()
    
    // If we can't detect the type, allow it but warn
    if (!detectedType) {
      return {
        isValid: true,
        detectedType: 'unknown',
        error: 'Could not detect file type from content'
      }
    }
    
    // Check if detected type matches declared type category
    const isValid = isMimeTypeMatch(declaredType, detectedType)
    
    return {
      isValid,
      detectedType,
      error: isValid ? undefined : `File content (${detectedType}) doesn't match declared type (${declaredType})`
    }
  } catch {
    return {
      isValid: false,
      error: 'Failed to validate file type'
    }
  }
}

function detectMimeTypeFromBytes(bytes: Uint8Array): string | null {
  // Check magic numbers for common file types
  const signatures: { [key: string]: number[][] } = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // Note: WEBP needs more complex detection
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'application/zip': [
      [0x50, 0x4B, 0x03, 0x04],
      [0x50, 0x4B, 0x05, 0x06], // Empty ZIP
      [0x50, 0x4B, 0x07, 0x08]  // Spanned ZIP
    ],
    'text/plain': [], // Text files are harder to detect by magic numbers
    'video/mp4': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]],
    'audio/mp3': [
      [0x49, 0x44, 0x33], // ID3 tag
      [0xFF, 0xFB]        // MPEG Layer 3
    ],
  }
  
  // Special case for WEBP
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp'
  }
  
  // Check for Microsoft Office documents (which are ZIP-based)
  if (bytes.length >= 4 && 
      bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    // Could be ZIP or Office document
    const text = new TextDecoder().decode(bytes)
    if (text.includes('word/')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (text.includes('xl/')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (text.includes('ppt/')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    return 'application/zip'
  }
  
  // Check other signatures
  for (const [mimeType, signatureList] of Object.entries(signatures)) {
    if (signatureList.length === 0) continue // Skip empty signatures
    
    for (const signature of signatureList) {
      if (bytes.length >= signature.length) {
        const matches = signature.every((byte, index) => bytes[index] === byte)
        if (matches) return mimeType
      }
    }
  }
  
  // Check if it's text-based
  if (isTextFile(bytes)) {
    const text = new TextDecoder().decode(bytes.slice(0, 1024))
    if (text.includes('<!DOCTYPE') || text.includes('<html')) return 'text/html'
    if (text.includes('{') && text.includes('}')) return 'application/json'
    if (text.includes('<?xml')) return 'application/xml'
    return 'text/plain'
  }
  
  return null
}

function isTextFile(bytes: Uint8Array): boolean {
  // Check if the file appears to be text by looking for non-printable characters
  const sample = bytes.slice(0, 1024)
  let textBytes = 0
  
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i]
    // Allow printable ASCII, tabs, newlines, and common UTF-8 sequences
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13 || byte >= 128) {
      textBytes++
    }
  }
  
  // If more than 95% of bytes are text-like, consider it text
  return (textBytes / sample.length) > 0.95
}

function isMimeTypeMatch(declared: string, detected: string): boolean {
  if (!declared || !detected) return false
  
  // Exact match
  if (declared === detected) return true
  
  // Category match (e.g., image/* matches image/jpeg)
  const declaredCategory = declared.split('/')[0]
  const detectedCategory = detected.split('/')[0]
  
  if (declaredCategory === detectedCategory) return true
  
  // Special cases for Office documents
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  
  if (declared.includes('officedocument') && detected === 'application/zip') return true
  if (officeTypes.includes(declared) && detected === 'application/zip') return true
  
  // ZIP files can be many things
  if (detected === 'application/zip' && (declared.includes('zip') || declared.includes('archive'))) return true
  
  return false
}

// Storage quota validation utilities
export const STORAGE_LIMIT = 10 * 1024 * 1024 // 10MB in bytes

export interface StorageValidationResult {
  canUpload: boolean
  availableSpace: number
  totalUsed: number
  storageLimit: number
  error?: string
  warningThreshold?: boolean
}

export function validateStorageQuota(
  currentUsage: number, 
  fileSize: number, 
  storageLimit: number = STORAGE_LIMIT
): StorageValidationResult {
  const availableSpace = storageLimit - currentUsage
  const wouldExceed = (currentUsage + fileSize) > storageLimit
  const warningThreshold = (currentUsage / storageLimit) > 0.8 // 80% threshold
  
  return {
    canUpload: !wouldExceed,
    availableSpace,
    totalUsed: currentUsage,
    storageLimit,
    error: wouldExceed 
      ? `Upload would exceed storage limit. Need ${formatFileSize(fileSize)} but only ${formatFileSize(availableSpace)} available.`
      : undefined,
    warningThreshold: warningThreshold && !wouldExceed
  }
}

export function validateMultipleFilesStorage(
  currentUsage: number,
  files: File[],
  storageLimit: number = STORAGE_LIMIT
): {
  validFiles: File[]
  rejectedFiles: Array<{ file: File; reason: string }>
  totalSize: number
  availableSpace: number
} {
  const availableSpace = storageLimit - currentUsage
  let cumulativeSize = 0
  const validFiles: File[] = []
  const rejectedFiles: Array<{ file: File; reason: string }> = []
  
  for (const file of files) {
    if (cumulativeSize + file.size <= availableSpace) {
      validFiles.push(file)
      cumulativeSize += file.size
    } else {
      rejectedFiles.push({
        file,
        reason: `Would exceed storage limit. Need ${formatFileSize(file.size)} but only ${formatFileSize(availableSpace - cumulativeSize)} remaining.`
      })
    }
  }
  
  return {
    validFiles,
    rejectedFiles,
    totalSize: cumulativeSize,
    availableSpace
  }
}
