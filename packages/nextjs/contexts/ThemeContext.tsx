"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  testnetMode: boolean;
  setTestnetMode: (enabled: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [testnetMode, setTestnetModeState] = useState(true);
  const [language, setLanguageState] = useState("English");
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("nestfi-theme") as Theme;
    const savedTestnet = localStorage.getItem("nestfi-testnet-mode");
    const savedLanguage = localStorage.getItem("nestfi-language");

    if (savedTheme) setThemeState(savedTheme);
    if (savedTestnet !== null) setTestnetModeState(savedTestnet === "true");
    if (savedLanguage) setLanguageState(savedLanguage);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const html = document.documentElement;
    
    // Set data-theme attribute for consistent theming
    html.setAttribute("data-theme", theme);
    
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.setProperty("--bg-primary", "#ffffff");
      root.style.setProperty("--bg-secondary", "#f8fafc");
      root.style.setProperty("--bg-tertiary", "#f1f5f9");
      root.style.setProperty("--text-primary", "#0f172a");
      root.style.setProperty("--text-secondary", "#475569");
      root.style.setProperty("--text-muted", "#94a3b8");
      root.style.setProperty("--border-color", "#e2e8f0");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.setProperty("--bg-primary", "#030303");
      root.style.setProperty("--bg-secondary", "#0a0a0f");
      root.style.setProperty("--bg-tertiary", "#12121a");
      root.style.setProperty("--text-primary", "#ffffff");
      root.style.setProperty("--text-secondary", "#a1a1aa");
      root.style.setProperty("--text-muted", "#52525b");
      root.style.setProperty("--border-color", "rgba(255,255,255,0.08)");
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("nestfi-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const setTestnetMode = (enabled: boolean) => {
    setTestnetModeState(enabled);
    localStorage.setItem("nestfi-testnet-mode", String(enabled));
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("nestfi-language", lang);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        testnetMode,
        setTestnetMode,
        language,
        setLanguage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
}

