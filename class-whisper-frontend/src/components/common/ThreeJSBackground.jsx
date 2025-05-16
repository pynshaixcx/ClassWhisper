// src/components/common/ThreeJSBackground.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import './ThreeJSBackground.scss';

const ThreeJSBackground = ({ intensity = 0.5, density = 100, speed = 0.1, color = null }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear container first
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Set colors based on theme and optional color prop
    const particleColor = color || (theme === 'dark' ? 0xffffff : 0x000000);
    const particleOpacity = theme === 'dark' ? 0.2 : 0.1;
    
    // Create particles
    const particles = new THREE.Group();
    scene.add(particles);
    
    const particleCount = density;
    const particleGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
      transparent: true,
      opacity: particleOpacity * intensity
    });
    
    // Create particle mesh instances
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Random position within a spherical volume
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 4 + Math.random() * 10;
      
      particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
      particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
      particle.position.z = radius * Math.cos(phi);
      
      // Random rotation
      particle.rotation.x = Math.random() * Math.PI;
      particle.rotation.y = Math.random() * Math.PI;
      particle.rotation.z = Math.random() * Math.PI;
      
      // Store initial position for animation
      particle.userData.initialPosition = { ...particle.position };
      
      // Random movement factors
      particle.userData.movementFactor = Math.random() * 0.01 + 0.005;
      particle.userData.movementDirection = Math.random() > 0.5 ? 1 : -1;
      
      particles.add(particle);
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotate the entire particle system
      particles.rotation.y += 0.0005 * speed;
      particles.rotation.x += 0.0002 * speed;
      
      // Move individual particles
      particles.children.forEach(particle => {
        // Subtle pulsing movement based on sine wave
        const time = Date.now() * 0.001;
        const initialPos = particle.userData.initialPosition;
        const factor = particle.userData.movementFactor;
        const direction = particle.userData.movementDirection;
        
        particle.position.x = initialPos.x + Math.sin(time * factor * speed) * 0.2 * direction;
        particle.position.y = initialPos.y + Math.cos(time * factor * speed) * 0.2 * direction;
        particle.position.z = initialPos.z + Math.sin(time * factor * speed * 0.5) * 0.1 * direction;
        
        // Slow rotation
        particle.rotation.x += 0.0005 * speed;
        particle.rotation.y += 0.0005 * speed;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse movement effect
    const handleMouseMove = (event) => {
      if (!containerRef.current) return;
      
      // Calculate mouse position relative to the container
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Slightly tilt particle system based on mouse position
      particles.rotation.y = mouseX * 0.1;
      particles.rotation.x = mouseY * 0.1;
    };
    
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      // Dispose of Three.js resources
      particles.children.forEach(particle => {
        particle.geometry.dispose();
        particle.material.dispose();
      });
      
      renderer.dispose();
    };
  }, [theme, intensity, density, speed, color]);
  
  return (
    <div className="three-background" ref={containerRef}></div>
  );
};

export default ThreeJSBackground;