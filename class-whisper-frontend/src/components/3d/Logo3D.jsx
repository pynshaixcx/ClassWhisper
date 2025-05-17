// src/components/3d/Logo3D.jsx
import React, { useRef, useEffect } from 'react';
import { createScene, createLogo3D } from '../../animations/threeD';
import { animate } from '../../animations';
import { useTheme } from '../../context/ThemeContext';
import './Logo3D.scss';

/**
 * A 3D animated logo component
 * 
 * @param {Object} props
 * @param {string} props.text - Logo text
 * @param {number} props.size - Logo size
 * @param {string} props.color - Logo color
 * @param {boolean} props.interactive - Whether logo reacts to mouse movement
 * @param {boolean} props.animated - Whether logo is animated
 */
const Logo3D = ({
  text = "CW",
  size = 1,
  color,
  interactive = true,
  animated = true,
  className = '',
  onClick,
  ...rest
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const logoRef = useRef(null);
  const animationRef = useRef(null);
  const { theme, themeColors } = useTheme();

  // Initialize 3D scene and logo
  useEffect(() => {
    if (!containerRef.current) return;

    // Set color based on theme or props
    const logoColor = color || (theme === 'dark' ? 0x7289da : 0x5a6acf);
    
    // Create 3D scene
    sceneRef.current = createScene(containerRef.current, {
      cameraZ: 5,
      enableDirectionalLight: true,
    });
    
    // Create 3D logo
    logoRef.current = createLogo3D(sceneRef.current.scene, {
      text,
      size,
      color: logoColor,
      position: { x: 0, y: 0, z: 0 }
    });
    
    // Set up mouse interaction
    const handleMouseMove = (e) => {
      if (!interactive || !containerRef.current || !sceneRef.current) return;
      
      const { scene } = sceneRef.current;
      
      // Calculate mouse position relative to container
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Rotate logo based on mouse position
      scene.rotation.y = mouseX * 0.3;
      scene.rotation.x = mouseY * 0.2;
    };
    
    // Set up click interaction for spinning animation
    const handleClick = () => {
      if (!animated || !logoRef.current) return;
      
      // Create a spinning animation
      animate(logoRef.current.group.rotation, {
        y: [logoRef.current.group.rotation.y, logoRef.current.group.rotation.y + Math.PI * 2],
        duration: 1500,
        easing: 'easeOutExpo'
      });
    };
    
    // Add event listeners
    if (interactive) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    if (animated && onClick) {
      containerRef.current.addEventListener('click', handleClick);
    }
    
    // Update animation loop
    const originalOnAnimate = sceneRef.current.options?.onAnimate;
    sceneRef.current.options = {
      ...sceneRef.current.options,
      onAnimate: (scene, camera, renderer) => {
        if (originalOnAnimate) originalOnAnimate(scene, camera, renderer);
        
        // Update logo
        if (logoRef.current) {
          logoRef.current.update();
        }
      }
    };
    
    // Clean up
    return () => {
      if (interactive && containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (animated && onClick && containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
      }
      
      if (sceneRef.current) {
        sceneRef.current.cleanup();
      }
    };
  }, [theme, size, text, interactive, animated, onClick]);

  // Update color when theme changes
  useEffect(() => {
    if (!logoRef.current) return;
    
    const logoColor = color || (theme === 'dark' ? 0x7289da : 0x5a6acf);
    logoRef.current.setColor(logoColor);
  }, [theme, color, themeColors]);

  return (
    <div 
      ref={containerRef} 
      className={`logo-3d ${interactive ? 'interactive' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    />
  );
};

export default Logo3D;