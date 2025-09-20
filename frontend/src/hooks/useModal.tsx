import { useState, useCallback } from 'react'

/**
 * Interface for the basic modal hook return value
 */
export interface UseModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean
  /** Function to open the modal */
  open: () => void
  /** Function to close the modal */
  close: () => void
  /** Function to toggle modal open/closed state */
  toggle: () => void
}

/**
 * Custom hook for managing basic modal state
 * 
 * Provides simple open/close/toggle functionality for modal components.
 * Uses useCallback for performance optimization.
 * 
 * @param initialState - Initial modal state (default: false)
 * @returns Object with modal state and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const modal = useModal()
 *   
 *   return (
 *     <div>
 *       <button onClick={modal.open}>Open Modal</button>
 *       <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *         <p>Modal content</p>
 *       </Modal>
 *     </div>
 *   )
 * }
 * ```
 */
export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

/**
 * Interface for the alert modal hook return value
 */
export interface UseAlertModalReturn {
  /** Whether the alert modal is currently open */
  isOpen: boolean
  /** Function to show an alert with title, message, and type */
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  /** Function to close the alert modal */
  closeAlert: () => void
  /** Current alert data (null when closed) */
  alertData: {
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null
}

/**
 * Custom hook for managing alert modal state and content
 * 
 * Provides functionality for displaying alert messages with different types.
 * Manages both the modal state and the alert content data.
 * 
 * @returns Object with alert modal state and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const alertModal = useAlertModal()
 *   
 *   const handleSuccess = () => {
 *     alertModal.showAlert('Success', 'Operation completed successfully!', 'success')
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Show Success</button>
 *       {alertModal.alertData && (
 *         <AlertModal
 *           isOpen={alertModal.isOpen}
 *           onClose={alertModal.closeAlert}
 *           title={alertModal.alertData.title}
 *           message={alertModal.alertData.message}
 *           type={alertModal.alertData.type}
 *         />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export const useAlertModal = (): UseAlertModalReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [alertData, setAlertData] = useState<{
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null>(null)

  const showAlert = useCallback((
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setAlertData({ title, message, type })
    setIsOpen(true)
  }, [])

  const closeAlert = useCallback(() => {
    setIsOpen(false)
    setAlertData(null)
  }, [])

  return {
    isOpen,
    showAlert,
    closeAlert,
    alertData,
  }
}

// Hook for managing confirmation modals
export interface UseConfirmModalReturn {
  isOpen: boolean
  showConfirm: (
    title: string, 
    message: string, 
    onConfirm: () => void,
    type?: 'danger' | 'warning' | 'info'
  ) => void
  closeConfirm: () => void
  confirmData: {
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'info'
  } | null
}

export const useConfirmModal = (): UseConfirmModalReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmData, setConfirmData] = useState<{
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'info'
  } | null>(null)

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setConfirmData({ title, message, onConfirm, type })
    setIsOpen(true)
  }, [])

  const closeConfirm = useCallback(() => {
    setIsOpen(false)
    setConfirmData(null)
  }, [])

  return {
    isOpen,
    showConfirm,
    closeConfirm,
    confirmData,
  }
}