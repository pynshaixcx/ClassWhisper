// src/components/layout/PageContainer.jsx
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnimation } from '../../context/AnimationContext';
import './PageContainer.scss';

/**
 * Container for main content with page transition animations
 */
const PageContainer = ({ children }) => {
  const location = useLocation();
  const { settings, globalScope } = useAnimation();
  const containerRef = useRef(null);
  const previousPathRef = useRef(null);
  
  // Handle page transitions
  useEffect(() => {
    // Skip animation on first render or if page transitions are disabled
    if (!containerRef.current || !globalScope || !settings.pageTransitions) return;
    
    // Determine transition direction based on navigation pattern
    const getDirection = () => {
      // If coming from a deeper path, transition from left
      if (previousPathRef.current && 
          previousPathRef.current.split('/').length > location.pathname.split('/').length) {
        return 'left';
      }
      // Otherwise transition from right (default)
      return 'right';
    };
    
    // Don't animate first page load
    if (previousPathRef.current !== null) {
      globalScope.methods.pageTransitionIn(containerRef.current, getDirection());
    }
    
    // Update previous path
    previousPathRef.current = location.pathname;
  }, [location.pathname, globalScope, settings.pageTransitions]);
  
  // Apply scroll restoration on navigation
  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <main ref={containerRef} className="page-container">
      {children}
    </main>
  );
};

export default PageContainer;