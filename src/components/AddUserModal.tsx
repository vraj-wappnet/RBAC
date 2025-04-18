
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { addNewUser, checkEmailExists } from '../lib/store/usersSlice';
import { toggleAddUserModal, addToast } from '../lib/store/uiSlice';
import { addAuditLog } from '../lib/store/auditLogsSlice';
import { AVAILABLE_MODULES, ROLE_PERMISSIONS, PASSWORD_RULES } from '../lib/constants';
import { Role } from '../lib/types';
import { X, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddUserModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAddUserModalOpen);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [permissions, setPermissions] = useState(() => {
    const initialPermissions: Record<string, Record<string, boolean>> = {};
    
    AVAILABLE_MODULES.forEach((module) => {
      initialPermissions[module.id] = { ...ROLE_PERMISSIONS.viewer };
    });
    
    return initialPermissions;
  });
  
  // Validation states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // Password validation
  const validatePassword = (value: string) => {
    const errors: string[] = [];
    
    if (value.length < PASSWORD_RULES.minLength) {
      errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
    }
    
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('Password must include an uppercase letter');
    }
    
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(value)) {
      errors.push('Password must include a lowercase letter');
    }
    
    if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(value)) {
      errors.push('Password must include a number');
    }
    
    if (PASSWORD_RULES.requireSpecial && !/[^A-Za-z0-9]/.test(value)) {
      errors.push('Password must include a special character');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };
  
  // Form validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push('Name is required');
    }
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email is invalid');
    } else if (emailExists) {
      errors.push('Email is already in use');
    }
    
    if (passwordErrors.length > 0) {
      errors.push('Password does not meet requirements');
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };
  
  // Handle email check
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);
    
    if (value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setIsCheckingEmail(true);
      
      // Debounce email check
      const timer = setTimeout(() => {
        dispatch(checkEmailExists(value))
          .unwrap()
          .then((exists) => {
            setEmailExists(exists);
            setIsCheckingEmail(false);
          });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  };
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };
  
  // Handle role change
  const handleRoleChange = (value: string) => {
    const newRole = value as Role;
    setRole(newRole);
    
    // Update permissions based on role
    if (newRole !== 'custom') {
      const newPermissions = { ...permissions };
      
      AVAILABLE_MODULES.forEach((module) => {
        newPermissions[module.id] = { ...ROLE_PERMISSIONS[newRole] };
      });
      
      setPermissions(newPermissions);
    }
  };
  
  // Handle permission change
  const handlePermissionChange = (
    moduleId: string,
    permission: keyof typeof ROLE_PERMISSIONS.admin,
    checked: boolean
  ) => {
    const newPermissions = { ...permissions };
    newPermissions[moduleId] = { ...newPermissions[moduleId], [permission]: checked };
    
    // Apply validation rules
    if (permission === 'read' && !checked) {
      newPermissions[moduleId].write = false;
      newPermissions[moduleId].delete = false;
      newPermissions[moduleId].share = false;
    } else if (permission === 'write' && !checked) {
      newPermissions[moduleId].delete = false;
    }
    
    setPermissions(newPermissions);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const userId = `user-${Date.now()}`;
    
    // Create new user
    dispatch(addNewUser({
      id: userId,
      name,
      email,
      role,
      permissions,
      createdAt: new Date().toISOString(),
    }));
    
    // Add audit log
    dispatch(addAuditLog({
      userId,
      action: 'User created',
      details: `Created user ${name} with ${role} role`,
    }));
    
    // Show success toast
    dispatch(addToast({
      message: 'User created successfully',
      type: 'success',
    }));
    
    // Close modal
    dispatch(toggleAddUserModal());
    
    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setRole('viewer');
    setPermissions(() => {
      const initialPermissions: Record<string, Record<string, boolean>> = {};
      
      AVAILABLE_MODULES.forEach((module) => {
        initialPermissions[module.id] = { ...ROLE_PERMISSIONS.viewer };
      });
      
      return initialPermissions;
    });
    setEmailTouched(false);
    setEmailExists(false);
    setPasswordErrors([]);
    setFormErrors([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => dispatch(toggleAddUserModal())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {formErrors.length > 0 && (
            <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Form Errors</h3>
              </div>
              <ul className="list-disc list-inside text-sm">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter user name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter user email"
                  required
                  className={emailExists && emailTouched ? 'border-destructive' : ''}
                />
                {emailTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingEmail ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : emailExists ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {emailExists && emailTouched && (
                <p className="text-xs text-destructive mt-1">
                  Email is already in use
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                required
              />
              {passwordErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordErrors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {role === 'custom' && (
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Module</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Read</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Write</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Delete</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AVAILABLE_MODULES.map((module) => (
                      <tr key={module.id} className="border-b border-border">
                        <td className="px-4 py-3 text-sm">{module.name}</td>
                        <td className="px-4 py-3">
                          <Checkbox
                            id={`${module.id}-read`}
                            checked={permissions[module.id]?.read || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.id, 'read', !!checked)
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            id={`${module.id}-write`}
                            checked={permissions[module.id]?.write || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.id, 'write', !!checked)
                            }
                            disabled={!permissions[module.id]?.read}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            id={`${module.id}-delete`}
                            checked={permissions[module.id]?.delete || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.id, 'delete', !!checked)
                            }
                            disabled={!permissions[module.id]?.write}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            id={`${module.id}-share`}
                            checked={permissions[module.id]?.share || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module.id, 'share', !!checked)
                            }
                            disabled={!permissions[module.id]?.read}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => dispatch(toggleAddUserModal())}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
