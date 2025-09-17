"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle, AlertCircle, Shield, FileX } from "lucide-react"
import { useFileOperations } from "@/hooks/useFiles"
import { useStorageStats } from "@/hooks/useStatistics"
import { formatFileSize, validateFileMimeType, validateMultipleFilesStorage, STORAGE_LIMIT } from "@/lib/utils"
import Button from "@/components/ui/Button"
import toast from "react-hot-toast"

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "validating" | "uploading" | "completed" | "error" | "validation-warning"
  error?: string
  validationResult?: {
    isValid: boolean
    detectedType?: string
    error?: string
  }
}
interface UploadResponse {
  uploadToken: string
}
interface UploadZoneProps {
  onUploadComplete?: () => void
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile: uploadFileMutation, completeUpload } = useFileOperations()
  const { stats: storageStats, loading: storageLoading } = useStorageStats()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (storageStats.totalUsed >= STORAGE_LIMIT) return
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (storageStats.totalUsed >= STORAGE_LIMIT) return
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (storageStats.totalUsed >= STORAGE_LIMIT) {
      toast.error("Cannot upload files: Storage limit reached")
      return
    }

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (storageStats.totalUsed >= STORAGE_LIMIT) {
      toast.error("Cannot upload files: Storage limit reached")
      return
    }
    
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    // Check if storage stats are loaded
    if (storageLoading) {
      toast.error("Please wait for storage information to load")
      return
    }

    // Filter out files that are too large (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    const sizeValidFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large (${formatFileSize(file.size)}). Maximum size is 100MB.`)
        return false
      }
      return true
    })

    if (sizeValidFiles.length === 0) return

    // Validate storage quota for multiple files
    const storageValidation = validateMultipleFilesStorage(
      storageStats.totalUsed,
      sizeValidFiles,
      STORAGE_LIMIT
    )

    // Show rejected files due to storage limits
    if (storageValidation.rejectedFiles.length > 0) {
      storageValidation.rejectedFiles.forEach(({ file, reason }) => {
        toast.error(`${file.name}: ${reason}`)
      })
    }

    // If no files can be uploaded due to storage constraints
    if (storageValidation.validFiles.length === 0) {
      toast.error(`Cannot upload any files. Storage limit exceeded. Available: ${formatFileSize(storageValidation.availableSpace)}`)
      return
    }

    // Show warning if approaching storage limit
    const usageAfterUpload = storageStats.totalUsed + storageValidation.totalSize
    const usagePercentage = (usageAfterUpload / STORAGE_LIMIT) * 100
    
    if (usagePercentage > 90) {
      toast(`⚠️ Storage nearly full! ${usagePercentage.toFixed(1)}% used after upload`, {
        duration: 5000,
        style: {
          background: '#fef3c7',
          color: '#92400e',
        }
      })
    }

    const validFiles = storageValidation.validFiles
    const newUploadFiles = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "validating" as const,
    }))

    setUploadFiles((prev) => [...prev, ...newUploadFiles])

    // Show success message for multiple files
    if (validFiles.length > 1) {
      toast.success(`Added ${validFiles.length} files for upload (${formatFileSize(storageValidation.totalSize)})`)
    }

    // Show info about rejected files
    if (storageValidation.rejectedFiles.length > 0) {
      toast(`${storageValidation.rejectedFiles.length} files rejected due to storage limits`, {
        duration: 4000,
        style: {
          background: '#fef3c7',
          color: '#92400e',
        }
      })
    }

    // Validate each file and then upload
    for (let i = 0; i < newUploadFiles.length; i++) {
      const uploadFile = newUploadFiles[i]
      const index = uploadFiles.length + i
      
      await validateAndUploadFile(uploadFile, index)
    }
  }

  const validateAndUploadFile = async (uploadFile: UploadFile, index: number) => {
    try {
      // First, validate MIME type
      const validationResult = await validateFileMimeType(uploadFile.file)
      
      setUploadFiles((prev) => 
        prev.map((f, i) => 
          i === index 
            ? { 
                ...f, 
                validationResult,
                status: validationResult.isValid ? "pending" : validationResult.error?.includes("doesn't match") ? "error" : "validation-warning"
              } 
            : f
        )
      )

      // If validation failed with a mismatch error, don't upload
      if (!validationResult.isValid && validationResult.error?.includes("doesn't match")) {
        toast.error(`File validation failed: ${uploadFile.file.name}`)
        return
      }

      // Show warning for uncertain validations but still allow upload
      if (!validationResult.isValid || validationResult.error) {
        toast(`⚠️ ${uploadFile.file.name}: ${validationResult.error}`, {
          duration: 4000,
          style: {
            background: '#fef3c7',
            color: '#92400e',
          }
        })
      }

      // Proceed with upload
      await uploadSingleFile(uploadFile, index)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation failed"
      setUploadFiles((prev) => 
        prev.map((f, i) => 
          i === index 
            ? { ...f, status: "error", error: errorMessage } 
            : f
        )
      )
      toast.error(`Failed to validate ${uploadFile.file.name}`)
    }
  }

  const uploadSingleFile = async (uploadFile: UploadFile, index: number) => {
    try {
      // Update status to uploading
      setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f)))

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f, i) => (i === index && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
        )
      }, 200)

      // Upload file
      const { data } = await uploadFileMutation({
        variables: {
          filename: uploadFile.file.name,
          filetype: uploadFile.file.type,
          filePath: `/${uploadFile.file.name}`,
          filesize: uploadFile.file.size,
          isPublic: false,
          file: uploadFile.file,
        },
      }) as { data: { uploadFile: UploadResponse } }

      // Complete upload
      await completeUpload({
        variables: {
          uploadToken: data.uploadFile.uploadToken,
        },
      })

      clearInterval(progressInterval)

      // Update to completed
      setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "completed", progress: 100 } : f)))

      toast.success(`${uploadFile.file.name} uploaded successfully`)
      onUploadComplete?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "error", error: errorMessage } : f)))

      toast.error(`Failed to upload ${uploadFile.file.name}`)
    }
  }

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearCompleted = () => {
    setUploadFiles((prev) => prev.filter((f) => f.status !== "completed"))
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          storageStats.totalUsed >= STORAGE_LIMIT 
            ? "border-red-300 bg-red-50 cursor-not-allowed opacity-75"
            : isDragOver 
              ? "border-blue-500 bg-blue-50 scale-105 shadow-lg" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <div className={`transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
          <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
            storageStats.totalUsed >= STORAGE_LIMIT 
              ? 'text-red-400'
              : isDragOver 
                ? 'text-blue-500' 
                : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {storageStats.totalUsed >= STORAGE_LIMIT 
              ? 'Storage limit reached'
              : isDragOver 
                ? 'Drop files here!' 
                : 'Drop files here or click to upload'
            }
          </h3>
          <p className="text-gray-500 mb-2">
            Support for single and multiple files • Maximum file size: 100MB
          </p>
          {!storageLoading && (
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-xs text-gray-400">
                Storage: {formatFileSize(storageStats.totalUsed)} / {formatFileSize(STORAGE_LIMIT)} used
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    (storageStats.totalUsed / STORAGE_LIMIT) > 0.9 
                      ? 'bg-red-500' 
                      : (storageStats.totalUsed / STORAGE_LIMIT) > 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((storageStats.totalUsed / STORAGE_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">
                {formatFileSize(STORAGE_LIMIT - storageStats.totalUsed)} available
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-4">
            Files will be validated for type consistency to prevent mismatched uploads
          </p>

          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            disabled={storageStats.totalUsed >= STORAGE_LIMIT}
          >
            {storageStats.totalUsed >= STORAGE_LIMIT ? 'Storage Full' : 'Choose Files'}
          </Button>
        </div>

        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          onChange={handleFileSelect} 
          className="hidden"
          accept="*/*"
        />
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Upload Progress</h4>
            <div className="flex items-center space-x-4">
              {!storageLoading && (
                <div className="text-xs text-gray-500">
                  Will use: {formatFileSize(uploadFiles.reduce((total, f) => total + f.file.size, 0))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                disabled={!uploadFiles.some((f) => f.status === "completed")}
              >
                Clear Completed
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</span>
                      
                      {/* Status icons */}
                      {uploadFile.status === "validating" && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {uploadFile.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {uploadFile.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {uploadFile.status === "validation-warning" && <FileX className="w-4 h-4 text-yellow-500" />}
                      
                      {/* Validation result indicator */}
                      {uploadFile.validationResult && (
                        <div className="flex items-center space-x-1">
                          {uploadFile.validationResult.isValid ? (
                            <div title="File type validated">
                              <Shield className="w-3 h-3 text-green-500" />
                            </div>
                          ) : (
                            <div title={uploadFile.validationResult.error || "Validation warning"}>
                              <Shield className="w-3 h-3 text-yellow-500" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* File type info */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">
                      Declared: {uploadFile.file.type || 'unknown'}
                    </span>
                    {uploadFile.validationResult?.detectedType && (
                      <span className="text-xs text-gray-500">
                        • Detected: {uploadFile.validationResult.detectedType}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        uploadFile.status === "completed"
                          ? "bg-green-500"
                          : uploadFile.status === "error"
                            ? "bg-red-500"
                            : uploadFile.status === "validation-warning"
                              ? "bg-yellow-500"
                              : uploadFile.status === "validating"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-blue-500"
                      }`}
                      style={{ 
                        width: uploadFile.status === "validating" ? "100%" : `${uploadFile.progress}%` 
                      }}
                    />
                  </div>

                  {/* Status text */}
                  <div className="mt-1">
                    {uploadFile.status === "validating" && (
                      <p className="text-xs text-blue-600">Validating file type...</p>
                    )}
                    {uploadFile.status === "validation-warning" && uploadFile.validationResult?.error && (
                      <p className="text-xs text-yellow-600">{uploadFile.validationResult.error}</p>
                    )}
                    {uploadFile.error && (
                      <p className="text-xs text-red-600">{uploadFile.error}</p>
                    )}
                    {uploadFile.status === "completed" && (
                      <p className="text-xs text-green-600">Upload completed successfully</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
