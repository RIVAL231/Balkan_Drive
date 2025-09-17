import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import type { SearchFilters, SearchResult, SortOption } from '@/types/search'

const SEARCH_FILES = gql`
  query SearchFiles(
    $query: String
    $mimeTypes: [String!]
    $sizeMin: Int
    $sizeMax: Int
    $dateFrom: String
    $dateTo: String
    $uploaderName: String
    $folderId: ID
    $sortBy: String
    $sortDirection: String
    $limit: Int
    $offset: Int
  ) {
    searchFiles(
      query: $query
      mimeTypes: $mimeTypes
      sizeMin: $sizeMin
      sizeMax: $sizeMax
      dateFrom: $dateFrom
      dateTo: $dateTo
      uploaderName: $uploaderName
      folderId: $folderId
      sortBy: $sortBy
      sortDirection: $sortDirection
      limit: $limit
      offset: $offset
    ) {
      files {
        id
        filename
        filetype
        filesize
        isPublic
        isPublicShared
        publicShareEnabledAt
        publicShareEnabledBy {
          id
          username
        }
        filepath
        filehash
        createdAt
        owner {
          id
          username
        }
        folder {
          id
          name
        }
      }
      totalCount
      hasMore
      facets {
        mimeTypes {
          type
          count
          category
        }
        uploaders {
          username
          userId
          count
        }
        sizeBuckets {
          range
          min
          max
          count
        }
      }
    }
  }
`

export interface SearchState {
  filters: SearchFilters
  sort: SortOption
  results: SearchResult | null
  isLoading: boolean
  error: string | null
  hasSearched: boolean
}

export interface UseSearchReturn {
  // State
  searchState: SearchState
  
  // Actions
  search: (newFilters?: Partial<SearchFilters>) => void
  clearSearch: () => void
  loadMore: () => void
  updateFilters: (newFilters: Partial<SearchFilters>) => void
  updateSort: (newSort: Partial<SortOption>) => void
  
  // Utilities
  canLoadMore: boolean
  totalResults: number
  currentResultsCount: number
}

const DEFAULT_FILTERS: SearchFilters = {}

const DEFAULT_SORT: SortOption = {
  field: 'createdAt',
  direction: 'desc'
}

const RESULTS_PER_PAGE = 24

interface SearchVariables {
  query?: string
  mimeTypes?: string[]
  sizeMin?: number
  sizeMax?: number
  dateFrom?: string
  dateTo?: string
  uploaderName?: string
  folderId?: string
  sortBy: string
  sortDirection: string
  limit: number
  offset: number
}

export const useSearch = (initialFilters: SearchFilters = {}): UseSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>({
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sort: DEFAULT_SORT,
    results: null,
    isLoading: false,
    error: null,
    hasSearched: false
  })

  const [executeSearch, { loading, error, data }] = useLazyQuery(SEARCH_FILES)
  const [executeLoadMore, { data: moreData }] = useLazyQuery(SEARCH_FILES)

  // Update loading state
  useEffect(() => {
    setSearchState(prev => ({ ...prev, isLoading: loading }))
  }, [loading])

  // Handle search results
  useEffect(() => {
    if (data && (data as any).searchFiles) {
      const result = (data as any).searchFiles as SearchResult
      setSearchState(prev => ({
        ...prev,
        results: result,
        error: null,
        hasSearched: true
      }))
    }
  }, [data])

  // Handle load more results
  useEffect(() => {
    if (moreData && (moreData as any).searchFiles && searchState.results) {
      const newResult = (moreData as any).searchFiles as SearchResult
      setSearchState(prev => ({
        ...prev,
        results: {
          ...newResult,
          files: [...prev.results!.files, ...newResult.files]
        }
      }))
    }
  }, [moreData, searchState.results])

  // Handle errors
  useEffect(() => {
    if (error) {
      setSearchState(prev => ({
        ...prev,
        error: error.message,
        hasSearched: true
      }))
    }
  }, [error])

  const buildSearchVariables = useCallback((
    filters: SearchFilters,
    sort: SortOption,
    offset: number = 0
  ): SearchVariables => {
    const variables: SearchVariables = {
      limit: RESULTS_PER_PAGE,
      offset,
      sortBy: sort.field,
      sortDirection: sort.direction.toUpperCase()
    }

    // Only include non-empty filter values
    if (filters.filename?.trim()) {
      variables.query = filters.filename.trim()
    }
    
    if (filters.mimeType && filters.mimeType.length > 0) {
      variables.mimeTypes = filters.mimeType
    }
    
    if (filters.sizeMin !== undefined && filters.sizeMin > 0) {
      variables.sizeMin = filters.sizeMin
    }
    
    if (filters.sizeMax !== undefined && filters.sizeMax > 0) {
      variables.sizeMax = filters.sizeMax
    }
    
    if (filters.dateFrom) {
      variables.dateFrom = filters.dateFrom
    }
    
    if (filters.dateTo) {
      variables.dateTo = filters.dateTo
    }
    
    if (filters.uploaderName?.trim()) {
      variables.uploaderName = filters.uploaderName.trim()
    }
    
    if (filters.folderId) {
      variables.folderId = filters.folderId
    }

    return variables
  }, [])

  const search = useCallback((newFilters: Partial<SearchFilters> = {}) => {
    const mergedFilters = { ...searchState.filters, ...newFilters }
    
    setSearchState(prev => ({
      ...prev,
      filters: mergedFilters,
      error: null,
      results: null
    }))

    const variables = buildSearchVariables(mergedFilters, searchState.sort, 0)
    executeSearch({ variables })
  }, [searchState.filters, searchState.sort, buildSearchVariables, executeSearch])

  const clearSearch = useCallback(() => {
    setSearchState({
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      results: null,
      isLoading: false,
      error: null,
      hasSearched: false
    })
  }, [])

  const loadMore = useCallback(() => {
    if (!searchState.results || !searchState.results.hasMore || loading) {
      return
    }

    const offset = searchState.results.files.length
    const variables = buildSearchVariables(searchState.filters, searchState.sort, offset)
    executeLoadMore({ variables })
  }, [searchState.results, searchState.filters, searchState.sort, buildSearchVariables, executeLoadMore, loading])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }))
  }, [])

  const updateSort = useCallback((newSort: Partial<SortOption>) => {
    const updatedSort = { ...searchState.sort, ...newSort }
    setSearchState(prev => ({
      ...prev,
      sort: updatedSort
    }))

    // If we have results, re-search with new sort
    if (searchState.hasSearched) {
      search()
    }
  }, [searchState.sort, searchState.hasSearched, search])

  // Computed values
  const canLoadMore = useMemo(() => {
    return !!(searchState.results?.hasMore && !loading)
  }, [searchState.results?.hasMore, loading])

  const totalResults = useMemo(() => {
    return searchState.results?.totalCount || 0
  }, [searchState.results?.totalCount])

  const currentResultsCount = useMemo(() => {
    return searchState.results?.files.length || 0
  }, [searchState.results?.files.length])

  return {
    searchState,
    search,
    clearSearch,
    loadMore,
    updateFilters,
    updateSort,
    canLoadMore,
    totalResults,
    currentResultsCount
  }
}

// Hook for quick filename search without advanced filters
export const useQuickSearch = () => {
  const searchHook = useSearch()
  
  const quickSearch = useCallback((filename: string) => {
    searchHook.search({ filename })
  }, [searchHook])

  return {
    ...searchHook,
    quickSearch
  }
}