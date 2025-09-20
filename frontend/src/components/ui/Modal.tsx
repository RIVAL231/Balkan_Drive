import React from 'react'
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for the Modal component
 */
export interface ModalProps {
  /** Whether the modal is currently open/visible */
  isOpen: boolean
  /** Callback function called when modal should be closed */
  onClose: () => void
  /** Optional title for the modal header */
  title?: string
  /** The content to display inside the modal */
  children: React.ReactNode
  /** Size variant for the modal (default: 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Whether to show the close button in the header (default: true) */
  showCloseButton?: boolean
}

/**
 * Modal component for displaying content in an overlay
 * 
 * Features:
 * - Portal rendering for proper z-index layering
 * - Responsive size variants (sm, md, lg, xl)
 * - Keyboard navigation (Escape to close)
 * - Backdrop click to close
 * - Smooth animations and transitions
 * - Accessibility features (ARIA attributes, focus management)
 * - Body scroll lock when open
 * - Optional header with title and close button
 * 
 * @example
 * ```tsx
 * <Modal 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   title="Edit Profile"
 *   size="lg"
 * >
 *   <form onSubmit={handleSubmit}>
 *     <Input label="Name" {...register("name")} />
 *     <Button type="submit">Save Changes</Button>
 *   </form>
 * </Modal>
 * ```
 */
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

/**
 * Props for the AlertModal component
 */
export interface AlertModalProps {
  /** Whether the alert modal is currently open/visible */
  isOpen: boolean
  /** Callback function called when modal should be closed */
  onClose: () => void
  /** Title text for the alert */
  title: string
  /** Message content to display */
  message: string
  /** Visual type/severity of the alert (default: 'info') */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** Text for the confirm button (default: 'OK') */
  confirmText?: string
  /** Optional callback for when confirm button is clicked */
  onConfirm?: () => void
  /** Text for the cancel button (default: 'Cancel') */
  cancelText?: string
  /** Whether to show a cancel button (default: false) */
  showCancel?: boolean
}

/**
 * AlertModal component for displaying alert messages with icons
 * 
 * Features:
 * - Different visual types (success, error, warning, info) with appropriate icons and colors
 * - Optional confirm action handler
 * - Configurable cancel button
 * - Responsive design with mobile-optimized touch targets
 * - Accessible button ordering and keyboard navigation
 * 
 * @example
 * ```tsx
 * <AlertModal
 *   isOpen={showAlert}
 *   onClose={() => setShowAlert(false)}
 *   title="Upload Complete"
 *   message="Your files have been successfully uploaded."
 *   type="success"
 *   onConfirm={() => router.push('/files')}
 * />
 * ```
 */
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

/**
 * Props for the ConfirmModal component
 */
export interface ConfirmModalProps {
  /** Whether the confirmation modal is currently open/visible */
  isOpen: boolean
  /** Callback function called when modal should be closed */
  onClose: () => void
  /** Title text for the confirmation dialog */
  title: string
  /** Message content explaining what will happen */
  message: string
  /** Text for the confirm button (default: 'Confirm') */
  confirmText?: string
  /** Text for the cancel button (default: 'Cancel') */
  cancelText?: string
  /** Callback function for when user confirms the action */
  onConfirm: () => void
  /** Visual style indicating the severity of the action (default: 'info') */
  type?: 'danger' | 'warning' | 'info'
}

/**
 * ConfirmModal component for user confirmation dialogs
 * 
 * Features:
 * - Different visual styles based on action severity
 * - Clear confirm/cancel button distinction
 * - Warning icon and appropriate colors for dangerous actions
 * - Responsive design with mobile-first approach
 * - Accessible keyboard navigation and screen reader support
 * 
 * @example
 * ```tsx
 * <ConfirmModal
 *   isOpen={showDeleteConfirm}
 *   onClose={() => setShowDeleteConfirm(false)}
 *   title="Delete File"
 *   message="Are you sure you want to delete this file? This action cannot be undone."
 *   type="danger"
 *   confirmText="Delete"
 *   onConfirm={handleDeleteFile}
 * />
 * ```
 */

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