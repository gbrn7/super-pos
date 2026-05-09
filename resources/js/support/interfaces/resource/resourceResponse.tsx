import { Link } from "./link";
import { Meta } from "./meta";

export interface ResourceResponse<T> {
  data: T[];
  links: Link[];
  meta: Meta;
}