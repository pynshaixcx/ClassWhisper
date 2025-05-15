// src/components/common/GlassCard.jsx
import React, { useRef, useState } from 'react';
import './GlassCard.scss';

/**
 * A reusable glassmorphism card component with optional 3D effect on hover
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.effect3D - Enable 3D tilt effect on hover
 * @param {boolean} props.hoverable - Enable hover animation
 * @param {string} props.title - Card title
 * @param {Function} props.onClick - Click handler function
 */
const GlassCard = ({ 
  children, 
  className = '',
  effect3D = false,
  hoverable = true,
  title,
  onClick,
  ...rest
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  
  // Handle 3D mouse movement effect
  const handleMouseMove = (e) => {
    if (!effect3D || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 20; // Adjust the divisor to control the tilt intensity
    const rotateY = (x - centerX) / 20;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none'
    });
  };
  
  // Reset tilt effect on mouse leave
  const handleMouseLeave = () => {
    if (!effect3D) return;
    
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };
  
  // Create className based on props
  const cardClassName = `glass-card ${hoverable ? 'hoverable' : ''} ${className}`;
  
  return (
    <div 
      className={cardClassName}
      ref={cardRef}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...rest}
    >
      {title && <div className="glass-card-header">{title}</div>}
      <div className={`glass-card-body ${!title ? 'no-header' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;