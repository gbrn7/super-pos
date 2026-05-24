export interface RoleForm {
  name: string;
  // guardName: string;
  permissions: string[];
}

export interface RoleFormError {
  name: string;
  // guardName: string;
  permissions: string;
}