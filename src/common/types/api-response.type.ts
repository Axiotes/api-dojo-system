export type ApiResponse<T> = {
  data: T;
  pagination?: {
    skip: number;
    limit: number;
  };
  total?: number;
};
