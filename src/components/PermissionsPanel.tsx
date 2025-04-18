import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import {
  updateUserRole,
  updateUserPermission,
  saveUserChanges,
  validateUserPermissions,
} from "../lib/store/usersSlice";
import { fetchUserAuditLogs, addAuditLog } from "../lib/store/auditLogsSlice";
import { addToast } from "../lib/store/uiSlice";
import { AVAILABLE_MODULES, ROLE_PERMISSIONS } from "../lib/constants";
import { User, Role } from "../lib/types";
import { Check, X, Save, AlertTriangle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PermissionsPanel() {
  const dispatch = useAppDispatch();
  const selectedUserId = useAppSelector((state) => state.users.selectedUserId);
  const users = useAppSelector((state) => state.users.list);
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const validationErrors = useAppSelector((state) => state.users.errors);
  const pendingChanges = useAppSelector((state) => state.users.pendingChanges);
  const auditLogs = useAppSelector((state) => state.auditLogs.logs);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchUserAuditLogs(selectedUserId));
      dispatch(validateUserPermissions());
    }
  }, [dispatch, selectedUserId]);

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center border-l border-border">
        <div className="text-center text-muted-foreground">
          <p>Select a user to view and edit permissions</p>
        </div>
      </div>
    );
  }

  const handleRoleChange = (value: string) => {
    dispatch(
      updateUserRole({
        userId: selectedUser.id,
        role: value as Role,
      })
    );

    // If changing to a predefined role, update all permissions accordingly
    if (value !== "custom") {
      AVAILABLE_MODULES.forEach((module) => {
        Object.entries(
          ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS]
        ).forEach(([permKey, permValue]) => {
          dispatch(
            updateUserPermission({
              userId: selectedUser.id,
              moduleId: module.id,
              permission: permKey as keyof typeof ROLE_PERMISSIONS.admin,
              value: permValue,
            })
          );
        });
      });
    }
  };

  const handlePermissionChange = (
    moduleId: string,
    permission: keyof typeof ROLE_PERMISSIONS.admin,
    checked: boolean
  ) => {
    dispatch(
      updateUserPermission({
        userId: selectedUser.id,
        moduleId,
        permission,
        value: checked,
      })
    );
  };

  const handleSaveChanges = () => {
    // Don't save if there are validation errors
    if (validationErrors.length > 0) {
      return;
    }

    // In a real app, this would make an API call
    dispatch(saveUserChanges(selectedUser.id));

    // Add audit log entry
    dispatch(
      addAuditLog({
        userId: selectedUser.id,
        action: "Permissions updated",
        details: `Permissions updated for user ${selectedUser.name}`,
      })
    );

    // Show success toast with undo option
    dispatch(
      addToast({
        message: "User permissions saved successfully",
        type: "success",
        action: {
          label: "Undo",
          onClick: () => {
            // In a real app, this would revert the changes
            dispatch(
              addToast({
                message: "Changes reverted",
                type: "info",
              })
            );
          },
        },
      })
    );
  };

  // Filter errors by module
  const getModuleErrors = (moduleId: string) => {
    return validationErrors.filter((error) => error.moduleId === moduleId);
  };

  const isAdmin = selectedUser.role === "admin";
  const isViewer = selectedUser.role === "viewer";

  return (
    <div className="h-full flex flex-col border-l border-border overflow-auto">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
            <p className="text-muted-foreground">{selectedUser.email}</p>
          </div>
          {pendingChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={validationErrors.length > 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Role</label>
          <Select value={selectedUser.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full">
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
      </div>

      <Tabs defaultValue="permissions" className="flex-1">
        <div className="border-b border-border px-6">
          <TabsList className="mb-0">
            <TabsTrigger value="permissions">
              <FileText className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Clock className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="permissions" className="p-6 flex-1">
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Validation Errors</h3>
              </div>
              <ul className="list-disc list-inside text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    {error.moduleId && (
                      <span className="font-semibold">
                        {
                          AVAILABLE_MODULES.find((m) => m.id === error.moduleId)
                            ?.name
                        }
                        :
                      </span>
                    )}{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Module
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Read
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Write
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Delete
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {AVAILABLE_MODULES.map((module) => {
                    const moduleErrors = getModuleErrors(module.id);
                    const modulePermissions =
                      selectedUser.permissions[module.id];

                    if (!modulePermissions) {
                      return null;
                    }

                    return (
                      <tr
                        key={module.id}
                        className={
                          moduleErrors.length > 0
                            ? "bg-destructive/5 border-b border-border"
                            : "border-b border-border"
                        }
                      >
                        <td className="px-4 py-3 text-sm">{module.name}</td>
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={modulePermissions.read}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "read",
                                !!checked
                              )
                            }
                            disabled={isAdmin || isViewer}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={modulePermissions.write}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "write",
                                !!checked
                              )
                            }
                            disabled={
                              isAdmin || isViewer || !modulePermissions.read
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={modulePermissions.delete}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "delete",
                                !!checked
                              )
                            }
                            disabled={
                              isAdmin || isViewer || !modulePermissions.write
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={modulePermissions.share}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "share",
                                !!checked
                              )
                            }
                            disabled={
                              isAdmin || isViewer || !modulePermissions.read
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isAdmin && (
              <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    Admin role has full access to all modules and permissions
                  </span>
                </div>
              </div>
            )}

            {isViewer && (
              <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Viewer role has read-only access to all modules</span>
                </div>
              </div>
            )}

            {selectedUser.role === "editor" && (
              <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    Editor role has read and write access to all modules
                  </span>
                </div>
                <div className="flex items-center">
                  <X className="h-4 w-4 mr-2 text-destructive" />
                  <span>Cannot delete content</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Activity</h3>

            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found for this user
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="border border-border rounded-md p-4 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
