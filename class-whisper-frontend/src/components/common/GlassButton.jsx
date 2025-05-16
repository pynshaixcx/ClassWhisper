// src/components/common/GlassButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './GlassButton.scss';

/**
 * A reusable glassmorphism button component with animation effects
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant (primary, secondary, success, danger, warning)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {Function} props.onClick - Click handler function
 */
const GlassButton = ({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) => {
  // Create className based on props
  const buttonClassName = `glass-button ${variant} ${size} ${className}`;
  
  // Framer Motion variants
  const buttonVariants = {
    initial: { 
      scale: 1,
      y: 0
    },
    hover: { 
      scale: 1.05, 
      y: -3,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    },
    tap: { 
      scale: 0.95,
      y: 0,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
    },
    disabled: {
      scale: 1,
      opacity: 0.7
    }
  };
  
  return (
    <motion.button
      className={buttonClassName}
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial="initial"
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      variants={buttonVariants}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...rest}
    >
      <span className="button-content">{children}</span>
      <span className="button-shine"></span>
    </motion.button>
  );
};

export default GlassButton;