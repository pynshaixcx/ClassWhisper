// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getThemeVariables } from '../styles/variables';

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
  const [animation3DEnabled, setAnimation3DEnabled] = useState(true);
  const [animationIntensity, setAnimationIntensity] = useState(0.7); // Scale from 0 to 1
  const [themeColors, setThemeColors] = useState(() => getThemeVariables(getInitialTheme()));
  
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
    
    // Update theme colors
    setThemeColors(getThemeVariables(theme));
    
  }, [theme]);
  
  // Effect to handle glassmorphism setting
  useEffect(() => {
    const savedGlassmorphism = localStorage.getItem('glassmorphism');
    if (savedGlassmorphism !== null) {
      setGlassmorphismEnabled(savedGlassmorphism === 'true');
    }
    
    const root = document.documentElement;
    if (glassmorphismEnabled) {
      root.classList.add('glassmorphism-enabled');
      root.classList.remove('glassmorphism-disabled');
    } else {
      root.classList.add('glassmorphism-disabled');
      root.classList.remove('glassmorphism-enabled');
    }
  }, [glassmorphismEnabled]);
  
  // Effect to handle 3D animation setting
  useEffect(() => {
    const saved3DAnimation = localStorage.getItem('animation3D');
    if (saved3DAnimation !== null) {
      setAnimation3DEnabled(saved3DAnimation === 'true');
    }
    
    const savedAnimationIntensity = localStorage.getItem('animationIntensity');
    if (savedAnimationIntensity !== null) {
      setAnimationIntensity(parseFloat(savedAnimationIntensity));
    }
    
    const root = document.documentElement;
    if (animation3DEnabled) {
      root.classList.add('animation-3d-enabled');
      root.classList.remove('animation-3d-disabled');
    } else {
      root.classList.add('animation-3d-disabled');
      root.classList.remove('animation-3d-enabled');
    }
    
    // Set animation intensity as a CSS variable
    root.style.setProperty('--animation-intensity', animationIntensity);
  }, [animation3DEnabled, animationIntensity]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  // Toggle glassmorphism effect
  const toggleGlassmorphism = () => {
    const newValue = !glassmorphismEnabled;
    setGlassmorphismEnabled(newValue);
    localStorage.setItem('glassmorphism', String(newValue));
  };
  
  // Toggle 3D animations
  const toggle3DAnimation = () => {
    const newValue = !animation3DEnabled;
    setAnimation3DEnabled(newValue);
    localStorage.setItem('animation3D', String(newValue));
  };
  
  // Update animation intensity
  const updateAnimationIntensity = (intensity) => {
    const newValue = Math.min(Math.max(parseFloat(intensity), 0), 1);
    setAnimationIntensity(newValue);
    localStorage.setItem('animationIntensity', String(newValue));
    
    // Update CSS variable
    const root = document.documentElement;
    root.style.setProperty('--animation-intensity', newValue);
  };
  
  // Set theme explicitly
  const setThemeExplicitly = (themeName) => {
    if (themeName === 'light' || themeName === 'dark') {
      setTheme(themeName);
    }
  };
  
  // Context value
  const value = {
    theme,
    themeColors,
    glassmorphismEnabled,
    animation3DEnabled,
    animationIntensity,
    isDarkTheme: theme === 'dark',
    toggleTheme,
    setTheme: setThemeExplicitly,
    toggleGlassmorphism,
    toggle3DAnimation,
    updateAnimationIntensity
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;