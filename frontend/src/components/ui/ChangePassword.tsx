import { useState } from 'react'
import { useAuth } from "@/hooks/auth"
import { X, Eye, EyeOff, Lock } from "lucide-react"
import Button from "./Button"
import Input from "./Input"
import Modal from "./Modal"
import toast from "react-hot-toast"

interface ChangePasswordProps {
  onClose: () => void
  isOpen: boolean
}

export default function ChangePassword({ onClose, isOpen }: ChangePasswordProps) {
  const { changePassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      await changePassword(formData.currentPassword, formData.newPassword)
      toast.success('Password changed successfully!')
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" showCloseButton={false}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              error={errors.currentPassword}
              placeholder="Enter your current password"
              disabled={isLoading}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-8 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              error={errors.newPassword}
              placeholder="Enter your new password"
              disabled={isLoading}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
              disabled={isLoading}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>At least 6 characters long</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword !== formData.currentPassword && formData.newPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Different from current password</span>
              </li>
            </ul>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="order-2 sm:order-1 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="order-1 sm:order-2 flex-1"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}