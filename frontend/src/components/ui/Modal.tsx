import React from 'react'
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-end sm:items-center justify-center p-2 sm:p-4">
        <div
          className={cn(
            'relative bg-white rounded-t-lg sm:rounded-lg shadow-xl transform transition-all w-full max-h-[90vh] overflow-y-auto',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900 pr-4">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal

// Alert Modal Component
export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
  showCancel?: boolean
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  cancelText = 'Cancel',
  showCancel = false,
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  const Icon = icons[type]

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={cn('mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full mb-3 sm:mb-4', 
          type === 'success' && 'bg-green-100',
          type === 'error' && 'bg-red-100',
          type === 'warning' && 'bg-yellow-100',
          type === 'info' && 'bg-blue-100'
        )}>
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColors[type])} />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4 sm:mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          {showCancel && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors order-2 sm:order-1"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={cn(
              'w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-white rounded-md transition-colors order-1 sm:order-2',
              type === 'success' && 'bg-green-600 hover:bg-green-700',
              type === 'error' && 'bg-red-600 hover:bg-red-700',
              type === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
              type === 'info' && 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Confirmation Modal Component
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  type?: 'danger' | 'warning' | 'info'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'danger',
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4',
          type === 'danger' && 'bg-red-100',
          type === 'warning' && 'bg-yellow-100',
          type === 'info' && 'bg-blue-100'
        )}>
          {type === 'danger' && <XCircle className="h-6 w-6 text-red-500" />}
          {type === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
          {type === 'info' && <Info className="h-6 w-6 text-blue-500" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
              type === 'danger' && 'bg-red-600 hover:bg-red-700',
              type === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
              type === 'info' && 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}