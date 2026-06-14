import { Pagination } from "./pagination";

export interface PaginationResponse<T> {
  items: T[];
  pagination: Pagination;
}