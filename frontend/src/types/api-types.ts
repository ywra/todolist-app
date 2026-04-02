export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
