import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  input: string;
  border: string;
  text: string;
  textSub: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  headerBg: string;
  tabBg: string;
}

export const LIGHT: ThemeColors = {
  background:  "#FFFFFF",
  surface:     "#F8F9FA",
  card:        "#FFFFFF",
  input:       "#F5F5F5",
  border:      "#F0F0F0",
  text:        "#111111",
  textSub:     "#555555",
  textMuted:   "#9CA3AF",
  primary:     "#3C6034",
  primarySoft: "#E8F5E9",
  headerBg:    "#FFFFFF",
  tabBg:       "#111111",
};

export const DARK: ThemeColors = {
  background:  "#0D1117",
  surface:     "#161B22",
  card:        "#1C2128",
  input:       "#21262D",
  border:      "#2D333B",
  text:        "#CDD9E5",
  textSub:     "#8B949E",
  textMuted:   "#636E7B",
  primary:     "#4CAF50",
  primarySoft: "#0D2211",
  headerBg:    "#161B22",
  tabBg:       "#111111",
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: LIGHT,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("darkMode").then((v) => {
      if (v === "true") setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      SecureStore.setItemAsync("darkMode", next ? "true" : "false");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DARK : LIGHT, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);