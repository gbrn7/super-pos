import { PaginationLink } from "./pagination-link";

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: PaginationLink[];
  prev_page_url: string;
  next_page_url: string;
}
