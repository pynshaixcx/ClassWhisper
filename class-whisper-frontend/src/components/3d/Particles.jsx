// src/components/3d/Particles.jsx
import React, { useRef, useEffect } from 'react';
import { createScene, createParticleSystem } from '../../animations/threeD';
import { useTheme } from '../../context/ThemeContext';
import './Particles.scss';

/**
 * 3D particle system component that creates an animated background
 * 
 * @param {Object} props
 * @param {number} props.count - Number of particles to render
 * @param {string} props.color - Particle color (hex or rgb)
 * @param {number} props.size - Particle size
 * @param {number} props.speed - Animation speed
 * @param {number} props.opacity - Particle opacity
 * @param {number} props.radius - Maximum distance from center
 * @param {boolean} props.interactive - Whether particles react to mouse
 * @param {boolean} props.fixed - Whether to fix position (not scroll with content)
 * @param {string} props.className - Additional CSS class names
 */
const Particles = ({
  count = 150,
  color,
  size = 0.05,
  speed = 0.1,
  opacity = 0.7,
  radius = 5,
  interactive = true,
  fixed = false,
  className = '',
  ...rest
}) => {
  // Container ref
  const containerRef = useRef(null);
  
  // Scene and particles ref
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Get theme colors
  const { theme, themeColors, animationIntensity } = useTheme();
  
  // Set up 3D scene with particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Determine particle color based on theme or props
    const particleColor = color || (theme === 'dark' ? 0xffffff : 0x000000);
    const particleOpacity = opacity * animationIntensity;
    
    // Create 3D scene
    sceneRef.current = createScene(containerRef.current, {
      cameraZ: 15,
      enableDirectionalLight: true
    });
    
    // Create particle system
    particlesRef.current = createParticleSystem(sceneRef.current.scene, {
      count: Math.floor(count * animationIntensity),
      color: particleColor,
      size: size * animationIntensity,
      opacity: particleOpacity,
      speed: speed * animationIntensity,
      radius: radius
    });
    
    // Handle mouse interaction
    if (interactive) {
      const handleMouseMove = (e) => {
        if (!containerRef.current || !sceneRef.current) return;
        
        const { scene, camera } = sceneRef.current;
        
        // Calculate mouse position relative to container
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Tilt the scene based on mouse position
        scene.rotation.x = mouseY * 0.1;
        scene.rotation.y = mouseX * 0.1;
      };
      
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      
      // Clean up event listener
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }
    
    // Add particle system update to animation loop
    const originalOnAnimate = sceneRef.current.options?.onAnimate;
    sceneRef.current.options = {
      ...sceneRef.current.options,
      onAnimate: (scene, camera, renderer) => {
        if (originalOnAnimate) originalOnAnimate(scene, camera, renderer);
        
        // Update particle system
        if (particlesRef.current) {
          particlesRef.current.update();
        }
      }
    };
    
    // Clean up scene
    return () => {
      if (sceneRef.current) {
        sceneRef.current.cleanup();
      }
    };
  }, [
    theme,
    color,
    count,
    size,
    speed,
    opacity,
    radius,
    interactive,
    animationIntensity
  ]);
  
  // Update colors when theme changes
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particleColor = color || (theme === 'dark' ? 0xffffff : 0x000000);
    particlesRef.current.setColor(particleColor);
    particlesRef.current.setOpacity(opacity * animationIntensity);
    particlesRef.current.setSize(size * animationIntensity);
  }, [theme, color, opacity, size, animationIntensity]);
  
  // Build class names
  const particlesClassName = `
    particles-container
    ${interactive ? 'interactive' : ''}
    ${fixed ? 'fixed' : ''}
    ${className}
  `;
  
  return (
    <div 
      ref={containerRef}
      className={particlesClassName}
      {...rest}
    />
  );
};

export default Particles;