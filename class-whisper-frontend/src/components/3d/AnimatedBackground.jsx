// src/components/3d/AnimatedBackground.jsx
import React, { useRef, useEffect } from 'react';
import { createScene, createParticleSystem, createAnimatedBackground } from '../../animations/threeD';
import { useTheme } from '../../context/ThemeContext';
import './AnimatedBackground.scss';

/**
 * An animated 3D background component with particles and gradient
 * 
 * @param {Object} props
 * @param {number} props.intensity - Particle intensity (0-1)
 * @param {number} props.density - Number of particles
 * @param {number} props.speed - Animation speed
 * @param {boolean} props.interactive - Whether background reacts to mouse movement
 * @param {Array} props.colors - Background gradient colors
 */
const AnimatedBackground = ({
  intensity = 0.5,
  density = 100,
  speed = 0.1,
  interactive = true,
  colors,
  className = '',
  ...rest
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  const backgroundRef = useRef(null);
  const { theme, themeColors } = useTheme();

  // Initialize scene and effects
  useEffect(() => {
    if (!containerRef.current) return;

    // Get theme-based colors
    const bgColors = colors || (theme === 'dark' 
      ? [0x1a2a6c, 0x2a5298, 0x0f2350]
      : [0xf0f4fd, 0xd4e0f7, 0xe8f0ff]);
    
    // Particle color based on theme
    const particleColor = theme === 'dark' ? 0xffffff : 0x000000;
    const particleOpacity = theme === 'dark' ? 0.2 : 0.1;
    
    // Create 3D scene
    sceneRef.current = createScene(containerRef.current, {
      cameraZ: 15,
      enableDirectionalLight: true,
    });
    
    // Create particle system
    particlesRef.current = createParticleSystem(sceneRef.current.scene, {
      count: density,
      color: particleColor,
      opacity: particleOpacity * intensity,
      size: 0.05,
      speed: speed * 0.5,
      radius: 10
    });
    
    // Create animated background
    backgroundRef.current = createAnimatedBackground(sceneRef.current.scene, {
      colors: bgColors,
      speed: speed,
      width: 40,
      height: 30
    });
    
    // Mouse interaction for particle movement
    const handleMouseMove = (e) => {
      if (!interactive || !containerRef.current || !sceneRef.current) return;
      
      const { scene, camera } = sceneRef.current;
      
      // Calculate mouse position relative to container
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Tilt the scene slightly based on mouse position
      scene.rotation.x = mouseY * 0.05;
      scene.rotation.y = mouseX * 0.05;
    };
    
    // Add mouse event listener
    if (interactive) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    // Update animation loop
    const originalOnAnimate = sceneRef.current.options?.onAnimate;
    sceneRef.current.options = {
      ...sceneRef.current.options,
      onAnimate: (scene, camera, renderer) => {
        if (originalOnAnimate) originalOnAnimate(scene, camera, renderer);
        
        // Update particle system
        if (particlesRef.current) {
          particlesRef.current.update();
        }
        
        // Update background
        if (backgroundRef.current) {
          backgroundRef.current.update();
        }
      }
    };
    
    // Clean up
    return () => {
      if (interactive && containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (sceneRef.current) {
        sceneRef.current.cleanup();
      }
    };
  }, [theme, intensity, density, speed, interactive, colors, themeColors]);
  
  // Update colors when theme changes
  useEffect(() => {
    if (!backgroundRef.current || !colors) return;
    
    const bgColors = theme === 'dark' 
      ? [0x1a2a6c, 0x2a5298, 0x0f2350]
      : [0xf0f4fd, 0xd4e0f7, 0xe8f0ff];
      
    backgroundRef.current.setColors(bgColors);
    
    if (particlesRef.current) {
      const particleColor = theme === 'dark' ? 0xffffff : 0x000000;
      particlesRef.current.setColor(particleColor);
      particlesRef.current.setOpacity(theme === 'dark' ? 0.2 * intensity : 0.1 * intensity);
    }
  }, [theme, intensity, colors, themeColors]);

  return (
    <div 
      ref={containerRef} 
      className={`animated-background ${interactive ? 'interactive' : ''} ${className}`}
      {...rest}
    />
  );
};

export default AnimatedBackground;