import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, FileText, User, HardDrive } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { SearchFilters } from '@/types/search'
import { COMMON_MIME_TYPES, FILE_SIZE_RANGES } from '@/types/search'

interface SearchBarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  isLoading?: boolean
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
  placeholder = "Search files by name..."
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleInputChange = (field: keyof SearchFilters, value: string | string[] | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleMimeTypeToggle = (mimeTypes: readonly string[]) => {
    const currentTypes = localFilters.mimeType || []
    const newTypes = currentTypes.includes(mimeTypes[0])
      ? currentTypes.filter(() => !mimeTypes.some(mt => currentTypes.includes(mt)))
      : [...currentTypes, ...mimeTypes]
    
    handleInputChange('mimeType', newTypes.length > 0 ? newTypes : undefined)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = { filename: localFilters.filename }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).some(key => 
    key !== 'filename' && localFilters[key as keyof SearchFilters] !== undefined
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Main search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={localFilters.filename || ''}
            onChange={(e) => handleInputChange('filename', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="pl-10 pr-4"
          />
        </div>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant={showAdvanced || hasActiveFilters ? "primary" : "secondary"}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.keys(localFilters).filter(key => 
                key !== 'filename' && localFilters[key as keyof SearchFilters] !== undefined
              ).length}
            </span>
          )}
        </Button>
        <Button
          onClick={onSearch}
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          {/* File type filters */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2" />
              File Types
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_MIME_TYPES.map((type) => {
                const isSelected = type.types.some(t => localFilters.mimeType?.includes(t))
                return (
                  <button
                    key={type.value}
                    onClick={() => handleMimeTypeToggle(type.types)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size range */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <HardDrive className="w-4 h-4 mr-2" />
              File Size
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum size</label>
                <select
                  value={localFilters.sizeMin || ''}
                  onChange={(e) => handleInputChange('sizeMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">No minimum</option>
                  {FILE_SIZE_RANGES.map((range, index) => (
                    <option key={index} value={range.min}>
                      {formatFileSize(range.min)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum size</label>
                <select
                  value={localFilters.sizeMax || ''}
                  onChange={(e) => handleInputChange('sizeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                >
                  <option value="">No maximum</option>
                  {FILE_SIZE_RANGES.map((range, index) => (
                    range.max && (
                      <option key={index} value={range.max}>
                        {formatFileSize(range.max)}
                      </option>
                    )
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Upload Date
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <Input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => handleInputChange('dateFrom', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <Input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => handleInputChange('dateTo', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Uploader name */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2" />
              Uploader
            </label>
            <Input
              type="text"
              placeholder="Search by uploader username..."
              value={localFilters.uploaderName || ''}
              onChange={(e) => handleInputChange('uploaderName', e.target.value || undefined)}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button
              onClick={clearFilters}
              variant="secondary"
              disabled={!hasActiveFilters}
              className="text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
            
            <div className="text-xs text-gray-500">
              {hasActiveFilters && (
                <span>
                  {Object.keys(localFilters).filter(key => 
                    key !== 'filename' && localFilters[key as keyof SearchFilters] !== undefined
                  ).length} filter(s) active
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar