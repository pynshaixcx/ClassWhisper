// src/components/analytics/StatCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import './StatCard.scss';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary',
  trend = null,
  animate = true,
  valuePrefix = '',
  valueSuffix = '',
  size = 'medium',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value) || 0;
  const cardRef = useRef(null);
  const isVisible = useRef(false);
  
  // Prepare className based on props
  const cardClassName = `stat-card ${size} ${className} ${iconColor}`;
  
  // Animate value on mount and when value changes
  useEffect(() => {
    // Only animate if requested and number is valid
    if (!animate || isNaN(targetValue)) {
      setDisplayValue(targetValue);
      return;
    }
    
    let startValue = 0;
    const duration = 1000; // Animation duration in ms
    const frameDuration = 1000 / 60; // Duration of a single frame (60fps)
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    // If we already have a display value, start from there
    if (displayValue > 0) {
      startValue = displayValue;
    }
    
    // Only start animation if element is visible in viewport
    if (isVisible.current) {
      const increment = (targetValue - startValue) / totalFrames;
      
      const counter = setInterval(() => {
        frame++;
        const newValue = startValue + (increment * frame);
        
        // Update state with current value
        setDisplayValue(
          frame < totalFrames
            ? Math.round(newValue * 100) / 100
            : targetValue
        );
        
        // End animation when we reach the target
        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);
      
      // Cleanup on unmount
      return () => clearInterval(counter);
    } else {
      setDisplayValue(targetValue);
    }
  }, [targetValue, animate, isVisible]);
  
  // Handle intersection observer to check if element is visible
  useEffect(() => {
    if (!cardRef.current || !animate) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible.current = true;
          // Trigger animation by updating state
          setDisplayValue(0);
          
          // Once visible, no need to observe anymore
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );
    
    observer.observe(cardRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [animate]);
  
  // Format the display value
  const formattedValue = () => {
    // If not a number, just display as is
    if (isNaN(displayValue)) return value;
    
    // Format large numbers
    if (displayValue >= 1000000) {
      return `${valuePrefix}${(displayValue / 1000000).toFixed(1)}M${valueSuffix}`;
    } else if (displayValue >= 1000) {
      return `${valuePrefix}${(displayValue / 1000).toFixed(1)}K${valueSuffix}`;
    }
    
    // Format decimal numbers
    if (Number.isInteger(displayValue)) {
      return `${valuePrefix}${displayValue}${valueSuffix}`;
    }
    
    return `${valuePrefix}${displayValue.toFixed(1)}${valueSuffix}`;
  };
  
  // Get trend icon and class
  const getTrendDetails = () => {
    if (!trend) return null;
    
    const trendValue = parseFloat(trend);
    if (isNaN(trendValue)) return null;
    
    if (trendValue > 0) {
      return { icon: 'fas fa-arrow-up', className: 'trend-up' };
    } else if (trendValue < 0) {
      return { icon: 'fas fa-arrow-down', className: 'trend-down' };
    }
    
    return { icon: 'fas fa-equals', className: 'trend-flat' };
  };
  
  const trendDetails = getTrendDetails();
  
  return (
    <GlassCard className={cardClassName} ref={cardRef} effect3D={true}>
      <div className="stat-icon">
        <i className={icon}></i>
      </div>
      
      <div className="stat-content">
        <motion.div
          className="stat-value"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {formattedValue()}
          
          {trendDetails && (
            <span className={`trend ${trendDetails.className}`}>
              <i className={trendDetails.icon}></i>
              {Math.abs(trend)}%
            </span>
          )}
        </motion.div>
        
        <div className="stat-meta">
          <h3 className="stat-title">{title}</h3>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;