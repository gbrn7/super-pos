import { MetaLink } from "./metaLink";

export interface Meta {
  current_page: number;
  links: MetaLink[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}
