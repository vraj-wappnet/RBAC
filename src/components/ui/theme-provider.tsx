import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { toggleDarkMode } from "@/lib/store/uiSlice";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: ThemeProviderProps) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const theme: Theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value: ThemeProviderState = {
    theme,
    setTheme: (newTheme: Theme) => {
      if ((newTheme === "dark") !== isDarkMode) {
        dispatch(toggleDarkMode());
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
