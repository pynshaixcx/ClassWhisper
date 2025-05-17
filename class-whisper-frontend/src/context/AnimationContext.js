// src/context/AnimationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { animate, createScope } from '../animations';

// Create animation context
const AnimationContext = createContext();

// Custom hook to use the animation context
export const useAnimation = () => useContext(AnimationContext);

/**
 * Animation provider to manage global animation settings and utilities
 */
export const AnimationProvider = ({ children }) => {
  // Global animation scope for shared animations
  const [globalScope, setGlobalScope] = useState(null);
  
  // Initialize animation scope on mount
  useEffect(() => {
    // Create global animation scope
    const scope = createScope({ root: document.documentElement }).add(self => {
      // Page transition animation
      self.add('pageTransitionIn', (element, direction = 'right') => {
        const x = direction === 'right' ? [100, 0] : [-100, 0];
        
        return animate(element, {
          opacity: [0, 1],
          translateX: x,
          duration: 800,
          easing: 'easeOutExpo',
        });
      });
      
      self.add('pageTransitionOut', (element, direction = 'left') => {
        const x = direction === 'left' ? [0, -100] : [0, 100];
        
        return animate(element, {
          opacity: [1, 0],
          translateX: x,
          duration: 600,
          easing: 'easeInExpo',
        });
      });
      
      // Fade animations
      self.add('fadeIn', (element, options = {}) => {
        return animate(element, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          easing: 'easeOutCubic',
          ...options
        });
      });
      
      self.add('fadeOut', (element, options = {}) => {
        return animate(element, {
          opacity: [1, 0],
          translateY: [0, 20],
          duration: 500,
          easing: 'easeInCubic',
          ...options
        });
      });
      
      // Modal/dialog animations
      self.add('modalOpen', (element) => {
        return animate(element, {
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 400,
          easing: 'easeOutQuint'
        });
      });
      
      self.add('modalClose', (element) => {
        return animate(element, {
          opacity: [1, 0],
          scale: [1, 0.9],
          duration: 300,
          easing: 'easeInQuint'
        });
      });
      
      // Success animation
      self.add('success', (element) => {
        return animate(element, {
          scale: [
            { value: 1, duration: 0 },
            { value: 1.2, duration: 150, easing: 'easeInOutQuad' },
            { value: 1, duration: 300, easing: 'spring(1, 80, 10, 0)' }
          ],
          borderColor: [
            { value: 'rgba(67, 181, 129, 0)', duration: 0 },
            { value: 'rgba(67, 181, 129, 1)', duration: 150 }
          ]
        });
      });
      
      // Error animation (shake)
      self.add('error', (element) => {
        return animate(element, {
          translateX: [
            { value: 0, duration: 0 },
            { value: -10, duration: 50 },
            { value: 10, duration: 50 },
            { value: -10, duration: 50 },
            { value: 10, duration: 50 },
            { value: -5, duration: 50 },
            { value: 5, duration: 50 },
            { value: 0, duration: 50 }
          ],
          borderColor: [
            { value: 'rgba(240, 71, 71, 0)', duration: 0 },
            { value: 'rgba(240, 71, 71, 1)', duration: 150 }
          ]
        });
      });
    });
    
    setGlobalScope(scope);
    
    // Clean up
    return () => {
      scope.revert();
    };
  }, []);
  
  // Animation settings state
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('animationSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse animation settings:', error);
      }
    }
    
    // Default animation settings
    return {
      enabled: true,
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      intensity: 1, // Scale factor for animations (0-1)
      pageTransitions: true,
      parallaxEffect: true,
      hoverEffects: true
    };
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('animationSettings', JSON.stringify(settings));
    
    // Update CSS variables for animation settings
    const root = document.documentElement;
    root.style.setProperty('--animation-intensity', settings.intensity);
    
    // Update reduced motion setting based on user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion !== settings.reduced) {
      setSettings(prev => ({ ...prev, reduced: prefersReducedMotion }));
    }
    
    // Add or remove animation classes based on settings
    if (!settings.enabled || settings.reduced) {
      root.classList.add('reduce-animations');
    } else {
      root.classList.remove('reduce-animations');
    }
  }, [settings]);
  
  // Update settings functions
  const toggleAnimations = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };
  
  const setAnimationIntensity = (intensity) => {
    const value = Math.max(0, Math.min(1, intensity));
    setSettings(prev => ({ ...prev, intensity: value }));
  };
  
  const togglePageTransitions = () => {
    setSettings(prev => ({ ...prev, pageTransitions: !prev.pageTransitions }));
  };
  
  const toggleParallaxEffect = () => {
    setSettings(prev => ({ ...prev, parallaxEffect: !prev.parallaxEffect }));
  };
  
  const toggleHoverEffects = () => {
    setSettings(prev => ({ ...prev, hoverEffects: !prev.hoverEffects }));
  };
  
  // Utility function to create element-specific animation scope
  const createElementScope = (element) => {
    if (!element) return null;
    return createScope({ root: element });
  };
  
  // Context value
  const contextValue = {
    // Animation settings
    settings,
    toggleAnimations,
    setAnimationIntensity,
    togglePageTransitions,
    toggleParallaxEffect,
    toggleHoverEffects,
    
    // Animation scopes and utilities
    globalScope,
    createElementScope,
    
    // Utility to check if animations should be disabled
    shouldReduceMotion: settings.reduced || !settings.enabled,
    
    // Helper to get intensity-adjusted duration
    getDuration: (baseDuration) => {
      return settings.enabled && !settings.reduced 
        ? baseDuration * (0.5 + settings.intensity * 0.5) 
        : 0;
    }
  };
  
  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;