// src/components/common/Loader.jsx
import React, { useRef, useEffect } from 'react';
import { animate, createScope } from '../../animations';
import { useTheme } from '../../context/ThemeContext';
import './Loader.scss';

/**
 * Loader component with multiple animation styles
 * 
 * @param {Object} props
 * @param {string} props.size - Loader size (sm, md, lg, xl)
 * @param {string} props.color - Loader color (inherits from theme if not specified)
 * @param {string} props.type - Loader animation type (spinner, dots, pulse, wave, ring, bar)
 * @param {string} props.text - Text to display with the loader
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.fullPage - Whether loader should cover the full page
 * @param {boolean} props.overlay - Whether to show a background overlay
 * @param {number} props.delay - Delay in ms before showing the loader
 * @param {number} props.speed - Animation speed factor (0.5 = half speed, 2 = double speed)
 */
const Loader = ({
  size = 'md',
  color,
  type = 'spinner',
  text,
  className = '',
  fullPage = false,
  overlay = false,
  delay = 0,
  speed = 1,
  ...rest
}) => {
  // Get theme context
  const { theme, themeColors } = useTheme();
  
  // Refs
  const loaderRef = useRef(null);
  const animationScope = useRef(null);
  const timeoutRef = useRef(null);
  const [visible, setVisible] = React.useState(delay === 0);
  
  // Apply delay if specified
  useEffect(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, delay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
  
  // Initialize animations
  useEffect(() => {
    if (!loaderRef.current || !visible) return;
    
    // Create animation scope
    animationScope.current = createScope({ root: loaderRef.current });
    
    // Add show animation based on loader type
    const setupLoaderAnimation = () => {
      switch (type) {
        case 'spinner':
          animate({
            targets: loaderRef.current.querySelector('.spinner-loader'),
            rotate: 360,
            duration: 1200 / speed,
            easing: 'linear',
            loop: true
          });
          break;
          
        case 'dots':
          animate({
            targets: loaderRef.current.querySelectorAll('.dot'),
            translateY: [0, -10, 0],
            duration: 1200 / speed,
            delay: anime.stagger(150),
            easing: 'easeInOutSine',
            loop: true
          });
          break;
          
        case 'pulse':
          animate({
            targets: loaderRef.current.querySelector('.pulse-loader'),
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
            duration: 1500 / speed,
            easing: 'easeInOutSine',
            loop: true
          });
          break;
          
        case 'wave':
          animate({
            targets: loaderRef.current.querySelectorAll('.wave-bar'),
            scaleY: [0.4, 1, 0.4],
            duration: 1200 / speed,
            delay: anime.stagger(100),
            easing: 'easeInOutSine',
            loop: true
          });
          break;
          
        case 'ring':
          // No animation needed as we're using CSS animation for the ring
          break;
          
        case 'bar':
          animate({
            targets: loaderRef.current.querySelector('.bar-loader-progress'),
            width: ['0%', '100%'],
            duration: 2000 / speed,
            easing: 'easeInOutSine',
            loop: true
          });
          break;
      }
    };
    
    setupLoaderAnimation();
    
    // Clean up
    return () => {
      if (animationScope.current) {
        animationScope.current.revert();
      }
    };
  }, [type, visible, speed]);
  
  // Don't render if not visible yet
  if (!visible) {
    return null;
  }
  
  // Get loader color
  const loaderColor = color || 'var(--color-primary)';
  
  // Build class names
  const loaderClassName = `
    loader 
    loader-${size} 
    loader-${type}
    ${fullPage ? 'loader-fullpage' : ''}
    ${overlay ? 'loader-overlay' : ''}
    ${className}
  `;
  
  // Render the loader based on type
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="spinner-loader" style={{ borderTopColor: loaderColor }}></div>
        );
        
      case 'dots':
        return (
          <div className="dots-loader">
            <div className="dot" style={{ backgroundColor: loaderColor }}></div>
            <div className="dot" style={{ backgroundColor: loaderColor }}></div>
            <div className="dot" style={{ backgroundColor: loaderColor }}></div>
          </div>
        );
        
      case 'pulse':
        return (
          <div className="pulse-loader" style={{ backgroundColor: loaderColor }}></div>
        );
        
      case 'wave':
        return (
          <div className="wave-loader">
            <div className="wave-bar" style={{ backgroundColor: loaderColor }}></div>
            <div className="wave-bar" style={{ backgroundColor: loaderColor }}></div>
            <div className="wave-bar" style={{ backgroundColor: loaderColor }}></div>
            <div className="wave-bar" style={{ backgroundColor: loaderColor }}></div>
            <div className="wave-bar" style={{ backgroundColor: loaderColor }}></div>
          </div>
        );
        
      case 'ring':
        return (
          <div 
            className="ring-loader" 
            style={{ 
              borderColor: `${loaderColor}33`,
              borderTopColor: loaderColor,
              animationDuration: `${1.2 / speed}s`
            }}
          ></div>
        );
        
      case 'bar':
        return (
          <div className="bar-loader">
            <div 
              className="bar-loader-track"
              style={{ backgroundColor: `${loaderColor}33` }}
            >
              <div 
                className="bar-loader-progress"
                style={{ backgroundColor: loaderColor }}
              ></div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="spinner-loader" style={{ borderTopColor: loaderColor }}></div>
        );
    }
  };
  
  return (
    <div
      ref={loaderRef}
      className={loaderClassName}
      {...rest}
    >
      <div className="loader-content">
        {renderLoader()}
        
        {text && (
          <div className="loader-text">{text}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Full page loader with overlay
 */
export const FullPageLoader = (props) => (
  <Loader
    fullPage
    overlay
    size="lg"
    text={props.text || 'Loading...'}
    {...props}
  />
);

/**
 * Inline loader - smaller size for inline usage
 */
export const InlineLoader = (props) => (
  <Loader
    size="sm"
    type="spinner"
    {...props}
  />
);

/**
 * Button loader - for use inside buttons
 */
export const ButtonLoader = (props) => (
  <Loader
    size="sm"
    type="spinner"
    className="button-loader"
    {...props}
  />
);

export default Loader;