import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, Permission, ValidationError, Role } from "../types";
import { VALIDATION_MESSAGES } from "../constants";

interface UsersState {
  list: User[];
  selectedUserId: string | null;
  isLoading: boolean;
  searchTerm: string;
  errors: ValidationError[];
  pendingChanges: boolean;
}

export const validatePermissions = (
  permissions: Record<string, Permission>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check each module's permissions
  Object.entries(permissions).forEach(([moduleId, permission]) => {
    // Rule 1: Write requires Read
    if (permission.write && !permission.read) {
      errors.push({
        moduleId,
        permission: "write",
        message: VALIDATION_MESSAGES.writeRequiresRead,
      });
    }

    // Rule 2: Delete requires Write
    if (permission.delete && !permission.write) {
      errors.push({
        moduleId,
        permission: "delete",
        message: VALIDATION_MESSAGES.deleteRequiresWrite,
      });
    }

    // Rule 3: Share requires Read
    if (permission.share && !permission.read) {
      errors.push({
        moduleId,
        permission: "share",
        message: VALIDATION_MESSAGES.shareRequiresRead,
      });
    }
  });

  return errors;
};

// Initialize users in the store
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { getState }) => {
    const state = getState() as { users: UsersState };
    return state.users.list;
  }
);

// Check if email exists in the store
export const checkEmailExists = createAsyncThunk(
  "users/checkEmailExists",
  async (email: string, { getState }) => {
    const state = getState() as { users: UsersState };
    return state.users.list.some((user) => user.email === email);
  }
);

const initialState: UsersState = {
  list: [],
  selectedUserId: null,
  isLoading: false,
  searchTerm: "",
  errors: [],
  pendingChanges: false,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
      state.errors = [];
      state.pendingChanges = false;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    updateUserRole: (
      state,
      action: PayloadAction<{ userId: string; role: Role }>
    ) => {
      const { userId, role } = action.payload;
      const user = state.list.find((u) => u.id === userId);

      if (user) {
        user.role = role;
        state.pendingChanges = true;
      }
    },
    updateUserPermission: (
      state,
      action: PayloadAction<{
        userId: string;
        moduleId: string;
        permission: keyof Permission;
        value: boolean;
      }>
    ) => {
      const { userId, moduleId, permission, value } = action.payload;
      const user = state.list.find((u) => u.id === userId);

      if (user && user.permissions[moduleId]) {
        user.permissions[moduleId][permission] = value;

        // Automatically update dependent permissions
        if (permission === "read" && !value) {
          user.permissions[moduleId].write = false;
          user.permissions[moduleId].delete = false;
          user.permissions[moduleId].share = false;
        }

        if (permission === "write" && !value) {
          user.permissions[moduleId].delete = false;
        }

        // Validate the updated permissions
        state.errors = validatePermissions(user.permissions);
        state.pendingChanges = true;
      }
    },
    saveUserChanges: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.pendingChanges = false;
    },
    addNewUser: (state, action: PayloadAction<User>) => {
      state.list.unshift(action.payload);
      state.pendingChanges = true;
    },
    validateUserPermissions: (state) => {
      if (state.selectedUserId) {
        const user = state.list.find((u) => u.id === state.selectedUserId);
        if (user) {
          state.errors = validatePermissions(user.permissions);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setSelectedUser,
  setSearchTerm,
  updateUserRole,
  updateUserPermission,
  saveUserChanges,
  addNewUser,
  validateUserPermissions,
} = usersSlice.actions;

export default usersSlice.reducer;
