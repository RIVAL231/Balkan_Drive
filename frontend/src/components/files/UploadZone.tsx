"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import { useFileOperations } from "@/hooks/useFiles"
import { formatFileSize } from "@/lib/utils"
import Button from "@/components/ui/Button"
import toast from "react-hot-toast"

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const newUploadFiles = files.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }))

    setUploadFiles((prev) => [...prev, ...newUploadFiles])

    // Start uploading each file
    newUploadFiles.forEach((uploadFile, index) => {
      uploadSingleFile(uploadFile, uploadFiles.length + index)
    })
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
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
        <p className="text-gray-500 mb-4">Support for multiple files. Maximum file size: 100MB</p>

        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          Choose Files
        </Button>

        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Upload Progress</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              disabled={!uploadFiles.some((f) => f.status === "completed")}
            >
              Clear Completed
            </Button>
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{uploadFile.file.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</span>
                      {uploadFile.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {uploadFile.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        uploadFile.status === "completed"
                          ? "bg-green-500"
                          : uploadFile.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>

                  {uploadFile.error && <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
