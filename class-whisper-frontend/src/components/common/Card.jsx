// src/components/common/Card.jsx
import React, { useRef, useEffect } from 'react';
import { createTiltEffect } from '../../animations';
import './Card.scss';

/**
 * A 3D card component with tilt effect and glassmorphism
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.effect3D - Enable 3D tilt effect on hover
 * @param {boolean} props.glass - Apply glassmorphism effect
 * @param {string} props.variant - Card style variant
 * @param {boolean} props.hoverable - Apply hover animation
 * @param {string} props.title - Card title
 * @param {Function} props.onClick - Click handler function
 */
const Card = ({
  children,
  className = '',
  effect3D = true,
  glass = true,
  variant = 'default',
  hoverable = true,
  title,
  onClick,
  ...rest
}) => {
  const cardRef = useRef(null);
  const tiltEffect = useRef(null);

  // Set up 3D tilt effect
  useEffect(() => {
    if (!cardRef.current || !effect3D) return;

    // Create tilt effect
    tiltEffect.current = createTiltEffect(cardRef.current);
    tiltEffect.current.enable();

    // Handle window resize
    const handleResize = () => {
      if (tiltEffect.current) {
        tiltEffect.current.update();
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up effect
    return () => {
      window.removeEventListener('resize', handleResize);
      if (tiltEffect.current) {
        tiltEffect.current.disable();
      }
    };
  }, [effect3D]);

  // Combine class names
  const cardClassName = `
    card 
    ${glass ? 'card-glass' : ''} 
    ${hoverable ? 'card-hoverable' : ''} 
    ${effect3D ? 'card-3d' : ''} 
    card-${variant} 
    ${className}
  `;

  return (
    <div
      ref={cardRef}
      className={cardClassName}
      onClick={onClick}
      {...rest}
    >
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className={`card-body ${!title ? 'no-header' : ''}`}>
        {children}
      </div>
      {glass && <div className="card-glass-effect"></div>}
    </div>
  );
};

export default Card;