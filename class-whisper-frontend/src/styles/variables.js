// src/styles/variables.js
// Colors in both hex format (for standard usage) and RGB format (for rgba usage)
const colors = {
    primary: {
      light: '#8ea1e1',
      main: '#7289da',
      dark: '#5b6eae',
      rgb: '114, 137, 218'
    },
    secondary: {
      light: '#b9c3cb',
      main: '#99aab5',
      dark: '#7a8c9b',
      rgb: '153, 170, 181'
    },
    success: {
      light: '#5fc79a',
      main: '#43b581',
      dark: '#389d6e',
      rgb: '67, 181, 129'
    },
    danger: {
      light: '#f26d6d',
      main: '#f04747',
      dark: '#d63c3c',
      rgb: '240, 71, 71'
    },
    warning: {
      light: '#fbb746',
      main: '#faa61a',
      dark: '#e08e00',
      rgb: '250, 166, 26'
    },
    info: {
      light: '#33c0f7',
      main: '#00b0f4',
      dark: '#0095cf',
      rgb: '0, 176, 244'
    }
  };
  
  // Theme configuration
  const themes = {
    light: {
      // Background colors
      bg: {
        main: '#ffffff',
        secondary: '#f5f7fa',
        tertiary: '#eff3f9',
        card: '#ffffff',
        rgb: '255, 255, 255'
      },
      // Text colors
      text: {
        main: '#121212',
        secondary: '#555555',
        muted: '#767676',
        inverse: '#ffffff',
        rgb: '18, 18, 18'
      },
      // Border colors
      border: {
        main: '#e0e0e0',
        light: '#f0f0f0',
        rgb: '224, 224, 224'
      },
      // Shadows
      shadow: {
        sm: '0 2px 5px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.08)'
      },
      // Glassmorphism
      glass: {
        bg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.2)'
      }
    },
    dark: {
      // Background colors
      bg: {
        main: '#181818',
        secondary: '#222222',
        tertiary: '#2a2a2a',
        card: '#1e1e1e',
        rgb: '24, 24, 24'
      },
      // Text colors
      text: {
        main: '#ffffff',
        secondary: '#cccccc',
        muted: '#999999',
        inverse: '#121212',
        rgb: '255, 255, 255'
      },
      // Border colors
      border: {
        main: '#333333',
        light: '#2a2a2a',
        rgb: '51, 51, 51'
      },
      // Shadows
      shadow: {
        sm: '0 2px 5px rgba(0, 0, 0, 0.2)',
        md: '0 4px 12px rgba(0, 0, 0, 0.25)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.3)'
      },
      // Glassmorphism
      glass: {
        bg: 'rgba(30, 30, 30, 0.5)',
        border: 'rgba(50, 50, 50, 0.5)'
      }
    }
  };
  
  // Other design variables
  const designSystem = {
    // Typography
    font: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "'Clash Display', sans-serif",
      code: "'SF Mono', 'Consolas', monospace"
    },
    // Font weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    // Border radius
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem',
      pill: '9999px'
    },
    // Layout
    layout: {
      headerHeight: '80px',
      sidebarWidth: '250px',
      contentMaxWidth: '1200px',
      contentPadding: '1.5rem',
      footerHeight: '300px'
    },
    // Transitions
    transition: {
      fast: '0.15s ease',
      medium: '0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      slow: '0.5s cubic-bezier(0.165, 0.84, 0.44, 1)'
    },
    // Spacing
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem'
    },
    // Z-index
    zIndex: {
      base: 1,
      dropdown: 10,
      sticky: 20,
      fixed: 30,
      modal: 40,
      popover: 50,
      tooltip: 60
    },
    // 3D and animation settings
    effects: {
      perspective: '1000px',
      rotateIntensity: '10deg',
      hoverScale: 1.05,
      activeScale: 0.98,
      animationDuration: {
        fast: 300,
        medium: 500,
        slow: 800
      }
    }
  };
  
  // Export all design tokens
  export { colors, themes, designSystem };
  
  // Helper function to get theme variables
  export const getThemeVariables = (themeName = 'light') => {
    const theme = themes[themeName] || themes.light;
    
    return {
      // Main colors
      colors,
      // Theme-specific colors and styles
      theme,
      // Design system
      ...designSystem
    };
  };
  
  export default getThemeVariables;