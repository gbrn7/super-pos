export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: number;
  updated_at: number;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  guard_name: string;
  created_at: number;
  updated_at: number;
  permissions: string[];
}