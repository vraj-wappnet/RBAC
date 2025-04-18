import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { Provider } from "react-redux";
import { store } from "../lib/store/store";
import { toggleDarkMode } from "../lib/store/uiSlice";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "../components/Header";
import UsersList from "../components/UsersList";
import PermissionsPanel from "../components/PermissionsPanel";
import AddUserModal from "../components/AddUserModal";
import ToastNotification from "../components/ToastNotification";

const RBACAdminPanel = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        <main className="flex-1 flex">
          <div className="w-1/3 border-r border-border">
            <UsersList />
          </div>
          <div className="w-2/3">
            <PermissionsPanel />
          </div>
        </main>

        <AddUserModal />
        <ToastNotification />
      </div>
    </ThemeProvider>
  );
};

// Wrap the component with the Redux Provider
const Index = () => {
  return (
    <Provider store={store}>
      <RBACAdminPanel />
    </Provider>
  );
};

export default Index;
