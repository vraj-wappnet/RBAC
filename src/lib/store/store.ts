import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import usersReducer from "./usersSlice";
import auditLogsReducer from "./auditLogsSlice";
import uiReducer from "./uiSlice";

// Persist configuration for users slice
const usersPersistConfig = {
  key: "users",
  storage,
  whitelist: ["list", "selectedUserId"], // Only persist these fields
};

// Persist configuration for audit logs slice
const auditLogsPersistConfig = {
  key: "auditLogs",
  storage,
  whitelist: ["logs"],
};

// Persist configuration for UI slice
const uiPersistConfig = {
  key: "ui",
  storage,
  whitelist: ["isDarkMode"], // Only persist dark mode preference
};

// Create persisted reducers
const persistedUsersReducer = persistReducer(usersPersistConfig, usersReducer);
const persistedAuditLogsReducer = persistReducer(
  auditLogsPersistConfig,
  auditLogsReducer
);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    users: persistedUsersReducer,
    auditLogs: persistedAuditLogsReducer,
    ui: persistedUiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
