import { useState, useCallback } from 'react'

export interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

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

// Hook for managing alert modals
export interface UseAlertModalReturn {
  isOpen: boolean
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  closeAlert: () => void
  alertData: {
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null
}

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