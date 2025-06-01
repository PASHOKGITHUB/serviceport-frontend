export interface ApiResponse<T> {
  status: string;
  message?: string;
  results?: number;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}