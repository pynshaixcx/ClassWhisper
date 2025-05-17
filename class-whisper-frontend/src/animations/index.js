// src/animations/index.js
import { animate, createScope, createSpring, stagger } from 'animejs';

// Export animations for use throughout the app
export { animate, createScope, createSpring, stagger };

// Helper function to create a reusable animation scope
export const createAnimationScope = (rootRef) => {
  return createScope({ root: rootRef });
};

// Common animation presets
export const fadeIn = (targets, options = {}) => {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    easing: 'easeOutExpo',
    ...options,
  });
};

export const fadeOut = (targets, options = {}) => {
  return animate(targets, {
    opacity: [1, 0],
    translateY: [0, 20],
    duration: 600,
    easing: 'easeInExpo',
    ...options,
  });
};

export const pulseAnimation = (targets, options = {}) => {
  return animate(targets, {
    scale: [
      { value: 1, duration: 0, easing: 'easeOutExpo' },
      { value: 1.05, duration: 250, easing: 'easeInOutQuad' },
      { value: 1, duration: 500, easing: createSpring({ stiffness: 300 }) }
    ],
    ...options,
  });
};

export const floatAnimation = (targets, options = {}) => {
  return animate(targets, {
    translateY: [0, -15, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true,
    ...options,
  });
};

// Staggered animation for lists
export const staggeredFadeIn = (targets, options = {}) => {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    easing: 'easeOutExpo',
    delay: stagger(100),
    ...options,
  });
};

// 3D rotation animations
export const rotate3D = (targets, options = {}) => {
  return animate(targets, {
    rotateX: [0, 360],
    rotateY: [0, 180],
    duration: 2000,
    easing: 'easeInOutSine',
    ...options,
  });
};

// Page transition animation
export const pageTransition = {
  in: (targets, direction = 'right') => {
    const x = direction === 'right' ? [100, 0] : [-100, 0];
    return animate(targets, {
      opacity: [0, 1],
      translateX: x,
      duration: 800,
      easing: 'easeOutExpo',
    });
  },
  out: (targets, direction = 'left') => {
    const x = direction === 'left' ? [0, -100] : [0, 100];
    return animate(targets, {
      opacity: [1, 0],
      translateX: x,
      duration: 600,
      easing: 'easeInExpo',
    });
  },
};

// Button hover animation
export const buttonHover = {
  in: (targets) => {
    return animate(targets, {
      scale: 1.05,
      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
      duration: 300,
      easing: 'easeOutQuad',
    });
  },
  out: (targets) => {
    return animate(targets, {
      scale: 1,
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      duration: 400,
      easing: createSpring({ stiffness: 400, damping: 10 }),
    });
  },
};

// Card tilt effect based on mouse position
export const createTiltEffect = (element) => {
  const card = element;
  let bounds;

  const resetTilt = () => {
    animate(card, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      duration: 400,
      easing: createSpring({ stiffness: 200, damping: 15 }),
    });
  };

  const tilt = (e) => {
    if (!bounds) bounds = card.getBoundingClientRect();
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    
    const percentX = (mouseX - centerX) / (bounds.width / 2);
    const percentY = (mouseY - centerY) / (bounds.height / 2);
    
    const maxRotation = 10; // max rotation in degrees
    
    animate(card, {
      rotateY: percentX * maxRotation,
      rotateX: -percentY * maxRotation,
      translateZ: 10,
      duration: 100,
      easing: 'linear',
    });
  };

  return {
    enable: () => {
      card.addEventListener('mousemove', tilt);
      card.addEventListener('mouseleave', resetTilt);
    },
    disable: () => {
      card.removeEventListener('mousemove', tilt);
      card.removeEventListener('mouseleave', resetTilt);
      resetTilt();
    },
    update: () => {
      bounds = card.getBoundingClientRect();
    }
  };
};