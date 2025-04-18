
import { Module } from './types';

export const AVAILABLE_MODULES: Module[] = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'users', name: 'Users Management' },
  { id: 'reports', name: 'Reports' },
  { id: 'settings', name: 'Settings' },
  { id: 'billing', name: 'Billing' },
  { id: 'analytics', name: 'Analytics' },
];

export const DEFAULT_PERMISSIONS = {
  read: false,
  write: false,
  delete: false,
  share: false,
};

export const ROLE_PERMISSIONS = {
  admin: {
    read: true,
    write: true,
    delete: true,
    share: true,
  },
  editor: {
    read: true,
    write: true,
    delete: false,
    share: true,
  },
  viewer: {
    read: true,
    write: false,
    delete: false,
    share: false,
  },
  custom: {
    read: false,
    write: false,
    delete: false,
    share: false,
  },
};

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export const VALIDATION_MESSAGES = {
  writeRequiresRead: 'Write permission requires Read permission',
  deleteRequiresWrite: 'Delete permission requires Write permission',
  shareRequiresRead: 'Share permission requires Read permission',
};

export const ITEMS_PER_PAGE = 10;
