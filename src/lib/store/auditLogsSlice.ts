import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuditLogEntry } from "../types";

interface AuditLogsState {
  logs: AuditLogEntry[];
  isLoading: boolean;
}

// Fetch audit logs from the store
export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAuditLogs",
  async (_, { getState }) => {
    const state = getState() as { auditLogs: AuditLogsState };
    return state.auditLogs.logs;
  }
);

// Fetch audit logs for a specific user
export const fetchUserAuditLogs = createAsyncThunk(
  "auditLogs/fetchUserAuditLogs",
  async (userId: string, { getState }) => {
    const state = getState() as { auditLogs: AuditLogsState };
    return state.auditLogs.logs.filter((log) => log.userId === userId);
  }
);

// Add new audit log entry
export const addAuditLog = createAsyncThunk(
  "auditLogs/addAuditLog",
  async (logEntry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newEntry: AuditLogEntry = {
      ...logEntry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    return newEntry;
  }
);

const initialState: AuditLogsState = {
  logs: [],
  isLoading: false,
};

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUserAuditLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserAuditLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
        state.isLoading = false;
      })
      .addCase(addAuditLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
      });
  },
});

export default auditLogsSlice.reducer;
