export interface APIResponseI<T> {
  data: T;
  message?: string;
  code?: number;
}
