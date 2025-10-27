import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";

export type Theme = {
  text: string;
  textSecondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  selected: string;
};

type ThemeContextType = {
  currentTheme: "light" | "dark";
  themeColors: Theme;
  setTheme: (value: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const getTheme = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          text: "#ffffff",
          textSecondary: "#8c8c8c",
          accent: "#5b38f8",
          background: "#000000",
          backgroundSecondary: "#141414",
          selected: "#292929",
        } as Theme;
      case 'light':
        return {
          text: "#000000",
          textSecondary: "#595959",
          accent: "#5b38f8",
          background: "#f0f2f5",
          backgroundSecondary: "#ffffff",
          selected: "#e6f7ff",
        } as Theme;
    }
  }
  
  const [themeColors, setThemeColors] = useState<Theme>(getTheme());  

  useEffect(() => {
    const root = window.document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setThemeColors(getTheme());
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setThemeColors(getTheme());
    }
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeColors,
      setTheme: setCurrentTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};