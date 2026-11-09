export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiErrorBody = {
  success: false
  error: string
  details?: unknown
}
