import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types";

interface UIState {
  isDarkMode: boolean;
  isAddUserModalOpen: boolean;
  isAuditLogOpen: boolean;
  toasts: Toast[];
  list: User[];
  selectedUserId: string | null;
  searchTerm: string;
  isLoading: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

const initialState: UIState = {
  isDarkMode: false,
  isAddUserModalOpen: false,
  isAuditLogOpen: false,
  toasts: [],
  list: [],
  selectedUserId: null,
  searchTerm: "",
  isLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleAddUserModal: (state) => {
      state.isAddUserModalOpen = !state.isAddUserModalOpen;
    },
    toggleAuditLog: (state) => {
      state.isAuditLogOpen = !state.isAuditLogOpen;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = `toast-${Date.now()}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    setUsersList: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
    },
    setSelectedUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  toggleAddUserModal,
  toggleAuditLog,
  addToast,
  removeToast,
  setUsersList,
  setSelectedUserId,
  setSearchTerm,
  setIsLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
