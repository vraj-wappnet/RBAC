import React from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { toggleAddUserModal } from "../lib/store/uiSlice";
import { useAppDispatch } from "../lib/hooks";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b border-border py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="rounded-md bg-primary p-2 text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">RBAC Admin Panel</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
          <Button onClick={() => dispatch(toggleAddUserModal())}>
            Add User
          </Button>
        </div>
      </div>
    </header>
  );
}
