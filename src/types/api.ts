export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResult<T> {
  items: T[]
  total_count: number
  page_index: number
  page_size: number
  total_pages: number
}
