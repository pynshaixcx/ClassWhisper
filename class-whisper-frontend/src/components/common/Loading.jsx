// src/components/common/Loading.jsx
import React from 'react';
import './Loading.scss';

/**
 * A loading spinner component with glassmorphism styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.type - Spinner type (spinner, dots, pulse)
 * @param {string} props.color - Spinner color
 * @param {string} props.text - Loading text
 * @param {boolean} props.fullScreen - Show as full screen overlay
 * @param {boolean} props.glass - Apply glassmorphism effect
 */
const Loading = ({ 
  size = 'md', 
  type = 'spinner',
  color = 'primary',
  text = 'Loading...',
  fullScreen = false,
  glass = true,
  ...rest
}) => {
  // Create className based on props
  const loaderClassName = `loader ${size} ${type} ${color}`;
  const containerClassName = `loading-container ${fullScreen ? 'full-screen' : ''} ${glass ? 'glass' : ''}`;
  
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={loaderClassName}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={loaderClassName}>
            <div className="pulse-ring"></div>
          </div>
        );
      case 'spinner':
      default:
        return <div className={loaderClassName}></div>;
    }
  };

  return (
    <div className={containerClassName} {...rest}>
      <div className="loading-content">
        {renderLoader()}
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

export default Loading;