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
