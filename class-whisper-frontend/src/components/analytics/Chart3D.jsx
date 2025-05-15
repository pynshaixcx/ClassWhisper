// src/components/analytics/Chart3D.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import './Chart3D.scss';

const Chart3D = ({
  title,
  subtitle,
  data,
  type = 'bar',
  height = 300,
  colors = ['#7289da', '#43b581', '#faa61a', '#f04747', '#00b0f4'],
  showLegend = true,
  showValue = true,
  animate = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);
  
  // Set className based on props
  const chartClassName = `chart-3d ${type} ${className}`;
  
  // Set up intersection observer to animate when chart is visible
  useEffect(() => {
    if (!chartRef.current || !animate) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(chartRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [animate]);
  
  // Get max value for scaling
  const getMaxValue = () => {
    if (!data || !data.length) return 0;
    
    if (type === 'bar' || type === 'column') {
      return Math.max(...data.map(item => parseFloat(item.value) || 0));
    } else if (type === 'pie' || type === 'donut') {
      return data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    }
    
    return 0;
  };
  
  const maxValue = getMaxValue();
  
  // Calculate percentages for pie/donut charts
  const calculatePercentage = (value) => {
    if (!maxValue || !value) return 0;
    return Math.round((value / maxValue) * 100);
  };
  
  // Format value for display
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value;
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (!data || !data.length) {
      return (
        <div className="chart-empty">
          <i className="fas fa-chart-bar"></i>
          <p>No data available</p>
        </div>
      );
    }
    
    switch (type) {
      case 'bar':
        return (
          <div className="bar-chart" style={{ height: `${height}px` }}>
            {data.map((item, index) => {
              const percentage = maxValue ? (parseFloat(item.value) || 0) / maxValue : 0;
              const barHeight = percentage * 100;
              
              return (
                <div className="bar-item" key={index}>
                  <div className="bar-container">
                    <motion.div
                      className="bar"
                      style={{ 
                        backgroundColor: colors[index % colors.length],
                        height: isVisible ? `${barHeight}%` : '0%'
                      }}
                      initial={{ height: '0%' }}
                      animate={{ height: isVisible ? `${barHeight}%` : '0%' }}
                      transition={{ 
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      {showValue && (
                        <div className="bar-value">
                          {formatValue(item.value)}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <div className="bar-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        );
        
      case 'column':
        return (
          <div className="column-chart" style={{ height: `${height}px` }}>
            {data.map((item, index) => {
              const percentage = maxValue ? (parseFloat(item.value) || 0) / maxValue : 0;
              const columnWidth = percentage * 100;
              
              return (
                <div className="column-item" key={index}>
                  <div className="column-label">{item.label}</div>
                  <div className="column-container">
                    <motion.div
                      className="column"
                      style={{ 
                        backgroundColor: colors[index % colors.length],
                        width: isVisible ? `${columnWidth}%` : '0%'
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: isVisible ? `${columnWidth}%` : '0%' }}
                      transition={{ 
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      {showValue && (
                        <div className="column-value">
                          {formatValue(item.value)}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      case 'pie':
      case 'donut':
        const total = data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        let cumulativePercentage = 0;
        
        // Calculate stroke-dasharray and stroke-dashoffset for each segment
        const segments = data.map((item, index) => {
          const percentage = (parseFloat(item.value) || 0) / total * 100;
          
          // Calculate stroke values
          const segmentLength = percentage * 5.65; // 5.65 is approximately 2PI * RADIUS where radius is 90
          const startPercentage = cumulativePercentage;
          cumulativePercentage += percentage;
          
          return {
            ...item,
            color: colors[index % colors.length],
            percentage,
            segmentLength,
            startPercentage
          };
        });
        
        return (
          <div className="pie-chart" style={{ height: `${height}px` }}>
            <div className="pie-container">
              <svg viewBox="0 0 200 200" className={type === 'donut' ? 'donut' : ''}>
                {segments.map((segment, index) => {
                  const circumference = 2 * Math.PI * 90; // 2πr where radius is 90
                  const strokeDasharray = `${segment.segmentLength} ${circumference - segment.segmentLength}`;
                  const rotation = segment.startPercentage * 3.6; // Convert percentage to degrees (360 * percentage / 100)
                  
                  return (
                    <motion.circle
                      key={index}
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="40"
                      strokeDasharray={strokeDasharray}
                      transform={`rotate(${-90 + rotation} 100 100)`}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ 
                        strokeDashoffset: isVisible ? 0 : circumference
                      }}
                      transition={{ 
                        duration: 1,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
                {type === 'donut' && (
                  <circle cx="100" cy="100" r="50" fill="var(--bg-primary)" />
                )}
              </svg>
              
              {showValue && (
                <div className="pie-center-value">
                  {formatValue(total)}
                </div>
              )}
            </div>
            
            {showLegend && (
              <div className="pie-legend">
                {segments.map((segment, index) => (
                  <div className="legend-item" key={index}>
                    <div className="legend-color" style={{ backgroundColor: segment.color }}></div>
                    <div className="legend-label">{segment.label}</div>
                    <div className="legend-value">
                      {formatValue(segment.value)} ({segment.percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <GlassCard className={chartClassName} ref={chartRef}>
      {(title || subtitle) && (
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="chart-body">
        {renderChart()}
      </div>
    </GlassCard>
  );
};

export default Chart3D;