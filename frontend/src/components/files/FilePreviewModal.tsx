import { useState, useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { useLazyQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useDownloadUrl } from '@/hooks/useFiles'

const GET_DOWNLOAD_URL_QUERY = gql`
  query GetDownloadUrl($fileId: ID!) {
    getDownloadUrl(fileId: $fileId)
  }
`

interface DownloadData {
  getDownloadUrl: string
}

interface FilePreviewModalProps {
  file: {
    id: string
    filename: string
    filetype: string
    filesize: number
  } | null
  isOpen: boolean
  onClose: () => void
}

/**
 * File Preview Modal Component
 * 
 * Displays a preview of files using their download URLs.
 * Supports images, videos, text files, and PDFs.
 */
function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [getDownloadUrl] = useLazyQuery(GET_DOWNLOAD_URL_QUERY)
  const { downloadFile } = useDownloadUrl()

  // Generate preview URL when file changes
  useEffect(() => {
    if (!file || !isOpen) {
      setPreviewUrl(null)
      setError(null)
      return
    }

    const generatePreviewUrl = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get the download URL from the backend
        const { data } = await getDownloadUrl({ variables: { fileId: file.id } })
        if ((data as DownloadData)?.getDownloadUrl) {
          setPreviewUrl((data as DownloadData).getDownloadUrl)
        } else {
          setError('Failed to get preview URL')
        }
      } catch (err) {
        setError('Failed to load preview')
        console.error('Preview error:', err)
      } finally {
        setLoading(false)
      }
    }

    generatePreviewUrl()
  }, [file, isOpen, getDownloadUrl])

  if (!isOpen || !file) return null

  const isImage = file.filetype.startsWith('image/')
  const isVideo = file.filetype.startsWith('video/')
  const isText = file.filetype.startsWith('text/') || file.filetype === 'application/json'
  const isPDF = file.filetype === 'application/pdf'
  const isWordDocument = file.filetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.filetype === 'application/msword'
  const isPowerPoint = file.filetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.filetype === 'application/vnd.ms-powerpoint'
  const isOfficeDocument = isWordDocument || isPowerPoint

  const handleDownload = async () => {
    await downloadFile(file.id, file.filename)
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <div className="text-6xl mb-4">📄</div>
          <p>{error || 'Preview not available'}</p>
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download to view
          </button>
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="flex justify-center">
          <img
            src={previewUrl}
            alt={file.filename}
            className="max-w-full max-h-96 object-contain"
            onError={() => setError('Failed to load image')}
          />
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="flex justify-center">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-96"
            onError={() => setError('Failed to load video')}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="h-96">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        </div>
      )
    }

    if (isText) {
      return (
        <div className="h-96 overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        </div>
      )
    }

    if (isOfficeDocument) {
      // Use Microsoft Office Online viewer for Word and PowerPoint documents
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
      
      return (
        <div className="h-96">
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={file.filename}
            onError={() => setError('Failed to load Office document')}
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <div className="text-6xl mb-4">📄</div>
        <p>Preview not supported for this file type</p>
        <p className="text-sm text-gray-400 mb-4">{file.filetype}</p>
        <p className="text-xs text-gray-400 mb-4 text-center max-w-md">
          Supported types: Images, Videos, PDFs, Text files, Word documents (.docx), PowerPoint presentations (.pptx)
        </p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download to view
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold truncate">{file.filename}</h2>
            <p className="text-sm text-gray-500">
              {file.filetype} • {(file.filesize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4">
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}

export default FilePreviewModal