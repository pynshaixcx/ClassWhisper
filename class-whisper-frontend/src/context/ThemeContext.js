// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check if dark mode is preferred or previously set
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check user's system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState(true);
  
  // Effect to handle theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update document attributes
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [theme]);
  
  // Effect to handle glassmorphism setting
  useEffect(() => {
    const savedGlassmorphism = localStorage.getItem('glassmorphism');
    if (savedGlassmorphism !== null) {
      setGlassmorphismEnabled(savedGlassmorphism === 'true');
    }
  }, []);
  
  // Update glassmorphism state
  const toggleGlassmorphism = () => {
    const newValue = !glassmorphismEnabled;
    setGlassmorphismEnabled(newValue);
    localStorage.setItem('glassmorphism', String(newValue));
    
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('glassmorphism-enabled');
      root.classList.remove('glassmorphism-disabled');
    } else {
      root.classList.add('glassmorphism-disabled');
      root.classList.remove('glassmorphism-enabled');
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  // Context value
  const value = {
    theme,
    setTheme,
    toggleTheme,
    glassmorphismEnabled,
    toggleGlassmorphism,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;