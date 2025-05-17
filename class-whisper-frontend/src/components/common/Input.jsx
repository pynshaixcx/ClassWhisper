// src/components/common/Input.jsx
import React, { useState, useRef, useEffect } from 'react';
import { animate, createScope } from '../../animations';
import './Input.scss';

/**
 * Reusable Input component with animation effects
 * 
 * @param {Object} props
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name attribute
 * @param {string} props.id - Input id attribute
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onFocus - Focus handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.placeholder - Input placeholder text
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.error - Error message to display
 * @param {string} props.hint - Hint text to display below input
 * @param {React.ReactNode} props.icon - Icon to display in input
 * @param {React.ReactNode} props.endIcon - Icon to display at end of input
 * @param {string} props.className - Additional CSS class names
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {string} props.variant - Input variant (default, filled, outlined)
 * @param {boolean} props.autoFocus - Whether input should auto-focus
 * @param {Function} props.onIconClick - Handler for icon click
 * @param {Function} props.onEndIconClick - Handler for end icon click
 */
const Input = ({
  type = 'text',
  label,
  name,
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  icon,
  endIcon,
  className = '',
  size = 'md',
  variant = 'default',
  autoFocus = false,
  onIconClick,
  onEndIconClick,
  ...rest
}) => {
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const labelRef = useRef(null);
  const animationScope = useRef(null);
  const previousValue = useRef(value);
  
  // Initialize animation scope
  useEffect(() => {
    if (!inputContainerRef.current) return;
    
    animationScope.current = createScope({ root: inputContainerRef.current }).add(self => {
      // Focus animation
      self.add('focus', () => {
        animate(inputContainerRef.current, {
          borderColor: error ? 'var(--color-danger)' : 'var(--color-primary)',
          boxShadow: error 
            ? '0 0 0 3px rgba(var(--color-danger-rgb), 0.2)'
            : '0 0 0 3px rgba(var(--color-primary-rgb), 0.2)',
          duration: 300,
          easing: 'easeOutQuad'
        });
        
        if (labelRef.current) {
          animate(labelRef.current, {
            fontSize: 'var(--font-size-xs)',
            translateY: '-22px',
            color: error ? 'var(--color-danger)' : 'var(--color-primary)',
            duration: 300,
            easing: 'easeOutQuad'
          });
        }
      });
      
      // Blur animation
      self.add('blur', () => {
        // Only animate back if there's no value
        const hasValue = inputRef.current && inputRef.current.value;
        
        animate(inputContainerRef.current, {
          borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          boxShadow: '0 0 0 0 rgba(var(--color-primary-rgb), 0)',
          duration: 300,
          easing: 'easeOutQuad'
        });
        
        if (labelRef.current && !hasValue) {
          animate(labelRef.current, {
            fontSize: 'var(--font-size-md)',
            translateY: '0',
            color: error ? 'var(--color-danger)' : 'var(--color-text-secondary)',
            duration: 300,
            easing: 'easeOutQuad'
          });
        }
      });
      
      // Error animation
      self.add('error', () => {
        animate(inputContainerRef.current, {
          translateX: [
            { value: -5, duration: 50 },
            { value: 5, duration: 50 },
            { value: -3, duration: 50 },
            { value: 3, duration: 50 },
            { value: 0, duration: 50 }
          ],
          borderColor: [
            { value: 'var(--color-danger)', duration: 0 }
          ],
          duration: 250
        });
      });
      
      // Success animation
      self.add('success', () => {
        animate(inputContainerRef.current, {
          borderColor: [
            { value: 'var(--color-success)', duration: 0 }
          ],
          boxShadow: [
            { value: '0 0 0 3px rgba(var(--color-success-rgb), 0.2)', duration: 0 },
            { value: '0 0 0 0 rgba(var(--color-success-rgb), 0)', duration: 500, delay: 1000 }
          ],
          duration: 500
        });
      });
    });
    
    return () => {
      if (animationScope.current) {
        animationScope.current.revert();
      }
    };
  }, [error]);
  
  // Watch for value changes to trigger success animation
  useEffect(() => {
    const inputValue = value?.toString() || '';
    const prevValue = previousValue.current?.toString() || '';
    
    if (
      inputValue !== prevValue && 
      inputValue.length > 0 && 
      prevValue.length > 0 && 
      !error && 
      !isFocused
    ) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 1500);
      
      if (animationScope.current) {
        animationScope.current.methods.success();
      }
    }
    
    previousValue.current = value;
  }, [value, error, isFocused]);
  
  // Handle focus and blur
  const handleFocus = (e) => {
    setIsFocused(true);
    
    if (animationScope.current) {
      animationScope.current.methods.focus();
    }
    
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    
    if (animationScope.current) {
      animationScope.current.methods.blur();
    }
    
    if (onBlur) onBlur(e);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };
  
  // Generate ID if not provided
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  
  // Determine input type for password fields
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;
  
  // Build class names
  const containerClassName = `
    input-container 
    input-${size} 
    input-${variant}
    ${error ? 'has-error' : ''} 
    ${disabled ? 'disabled' : ''} 
    ${isFocused ? 'focused' : ''} 
    ${showSuccessAnimation ? 'success' : ''}
    ${value ? 'has-value' : ''}
    ${className}
  `;
  
  // Icon for password visibility toggle
  const passwordVisibilityIcon = (
    <button 
      type="button" 
      className="input-icon end-icon password-toggle"
      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
      onClick={togglePasswordVisibility}
    >
      {isPasswordVisible ? (
        <i className="fas fa-eye-slash"></i>
      ) : (
        <i className="fas fa-eye"></i>
      )}
    </button>
  );
  
  return (
    <div className="input-field">
      <div 
        ref={inputContainerRef}
        className={containerClassName}
      >
        {icon && (
          <span 
            className={`input-icon ${onIconClick ? 'clickable' : ''}`}
            onClick={onIconClick}
          >
            {icon}
          </span>
        )}
        
        <div className="input-wrapper">
          {label && (
            <label 
              ref={labelRef}
              htmlFor={inputId}
              className={`input-label ${value ? 'active' : ''}`}
            >
              {label}
              {required && <span className="required-mark">*</span>}
            </label>
          )}
          
          <input
            ref={inputRef}
            type={inputType}
            id={inputId}
            name={name}
            className="input-element"
            value={value || ''}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            {...rest}
          />
        </div>
        
        {type === 'password' && (
          passwordVisibilityIcon
        )}
        
        {endIcon && type !== 'password' && (
          <span 
            className={`input-icon end-icon ${onEndIconClick ? 'clickable' : ''}`}
            onClick={onEndIconClick}
          >
            {endIcon}
          </span>
        )}
        
        {variant === 'filled' && <div className="input-fill-highlight"></div>}
      </div>
      
      {(error || hint) && (
        <div className={`input-feedback ${error ? 'error' : 'hint'}`}>
          {error || hint}
        </div>
      )}
    </div>
  );
};

export default Input;