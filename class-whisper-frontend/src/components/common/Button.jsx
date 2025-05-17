// src/components/common/Button.jsx
import React, { useRef, useEffect } from 'react';
import { createScope, animate, createSpring } from '../../animations';
import './Button.scss';

/**
 * Custom button component with animation effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS class names
 * @param {string} props.variant - Button style variant (primary, secondary, etc.)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.isLoading - Whether button is in loading state
 * @param {React.ReactNode} props.leftIcon - Icon to show at left side
 * @param {React.ReactNode} props.rightIcon - Icon to show at right side
 */
const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  isLoading = false,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  // Create refs for animation
  const buttonRef = useRef(null);
  const animationScope = useRef(null);
  const shineRef = useRef(null);

  // Set up animation scope
  useEffect(() => {
    // Skip animations if button is disabled
    if (disabled) return;

    // Create animation scope for the button
    animationScope.current = createScope({ root: buttonRef }).add(self => {
      // Add hover animation
      self.add('hover', () => {
        animate(buttonRef.current, {
          scale: 1.05,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          duration: 400,
          easing: 'easeOutQuart',
        });
      });

      // Add unhover animation
      self.add('unhover', () => {
        animate(buttonRef.current, {
          scale: 1,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          duration: 400,
          easing: createSpring({ stiffness: 400, damping: 15 }),
        });
      });

      // Add click animation
      self.add('click', () => {
        animate(buttonRef.current, {
          scale: [
            { value: 0.95, duration: 100, easing: 'easeOutQuad' },
            { value: 1, duration: 400, easing: createSpring({ stiffness: 400, damping: 8 }) }
          ],
        });
      });

      // Add shine animation
      self.add('shine', () => {
        animate(shineRef.current, {
          translateX: ['0%', '200%'],
          duration: 1000,
          easing: 'easeOutQuart',
        });
      });
    });

    // Clean up animations
    return () => {
      if (animationScope.current) {
        animationScope.current.revert();
      }
    };
  }, [disabled]);

  // Event handlers
  const handleMouseEnter = () => {
    if (disabled || isLoading || !animationScope.current) return;
    animationScope.current.methods.hover();
  };

  const handleMouseLeave = () => {
    if (disabled || isLoading || !animationScope.current) return;
    animationScope.current.methods.unhover();
  };

  const handleButtonClick = (e) => {
    if (disabled || isLoading || !animationScope.current) return;
    
    // Run click animation
    animationScope.current.methods.click();
    animationScope.current.methods.shine();
    
    // Run click handler
    if (onClick) onClick(e);
  };

  // Combine class names
  const buttonClassName = `btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className}`;

  return (
    <button
      ref={buttonRef}
      className={buttonClassName}
      type={type}
      disabled={disabled || isLoading}
      onClick={handleButtonClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div className="btn-content">
        {isLoading && <span className="spinner"></span>}
        {!isLoading && leftIcon && <span className="btn-icon left-icon">{leftIcon}</span>}
        <span className="btn-text">{children}</span>
        {!isLoading && rightIcon && <span className="btn-icon right-icon">{rightIcon}</span>}
      </div>
      <span ref={shineRef} className="btn-shine"></span>
    </button>
  );
};

export default Button;