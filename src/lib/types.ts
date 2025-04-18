
export type Role = 'admin' | 'editor' | 'viewer' | 'custom';

export interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  share: boolean;
}

export interface Module {
  id: string;
  name: string;
}

export interface UserPermissions {
  [moduleId: string]: Permission;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: UserPermissions;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface ValidationError {
  moduleId?: string;
  permission?: keyof Permission;
  message: string;
}
