// src/animations/cardAnimations.js
import { animate, createSpring } from 'animejs';

/**
 * Applies a hover animation to a card element
 * @param {HTMLElement} card - The card element to animate
 * @param {Object} options - Animation options
 * @returns {Object} - Animation controller
 */
export const cardHoverEffect = (card, options = {}) => {
  const defaults = {
    translateY: -8,
    scale: 1.02,
    duration: 400,
    easing: 'easeOutQuart',
    shadowStart: 'var(--shadow-md)',
    shadowEnd: 'var(--shadow-lg)',
  };

  const config = { ...defaults, ...options };

  return {
    enter: () => {
      return animate(card, {
        translateY: config.translateY,
        scale: config.scale,
        boxShadow: config.shadowEnd,
        duration: config.duration,
        easing: config.easing,
      });
    },
    leave: () => {
      return animate(card, {
        translateY: 0,
        scale: 1,
        boxShadow: config.shadowStart,
        duration: config.duration,
        easing: createSpring({ stiffness: 300, damping: 20 }),
      });
    },
  };
};

/**
 * Creates a flip animation for a card
 * @param {HTMLElement} card - The card element to animate
 * @param {Object} options - Animation options
 * @returns {Function} - Function to trigger the flip
 */
export const cardFlipEffect = (card, options = {}) => {
  const defaults = {
    duration: 800,
    easing: 'easeOutExpo',
    shouldRotateY: true,
  };

  const config = { ...defaults, ...options };
  let isFlipped = false;

  return () => {
    isFlipped = !isFlipped;
    const rotationAxis = config.shouldRotateY ? 'rotateY' : 'rotateX';
    const rotationValue = isFlipped ? 180 : 0;

    return animate(card, {
      [rotationAxis]: rotationValue,
      duration: config.duration,
      easing: config.easing,
    });
  };
};

/**
 * Creates a ripple effect when clicking on a card
 * @param {HTMLElement} card - The card element
 * @param {Object} options - Animation options
 */
export const cardRippleEffect = (card, options = {}) => {
  const config = {
    color: 'rgba(255, 255, 255, 0.7)',
    duration: 700,
    ...options,
  };

  // Add click handler to create ripple
  card.addEventListener('mousedown', (event) => {
    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    
    // Style the ripple
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = config.color;
    ripple.style.pointerEvents = 'none';
    ripple.style.transformOrigin = 'center';
    ripple.style.zIndex = '1';
    
    // Position the ripple based on click coordinates
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    
    // Add to card
    card.style.overflow = 'hidden';
    card.style.position = card.style.position === 'static' ? 'relative' : card.style.position;
    card.appendChild(ripple);
    
    // Animate ripple
    animate(ripple, {
      scale: [0, 1],
      opacity: [1, 0],
      duration: config.duration,
      easing: 'easeOutExpo',
      complete: () => {
        card.removeChild(ripple);
      },
    });
  });
};

/**
 * Applies a staggered animation to a grid of cards
 * @param {NodeList|Array} cards - Collection of card elements
 * @param {Object} options - Animation options
 * @returns {Object} - Animation controller
 */
export const staggeredCardsAnimation = (cards, options = {}) => {
  const defaults = {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 600,
    delay: 50,
    easing: 'easeOutQuint',
  };

  const config = { ...defaults, ...options };

  return {
    show: () => {
      return animate(cards, {
        translateY: config.translateY,
        opacity: config.opacity,
        duration: config.duration,
        delay: function(el, i) {
          return i * config.delay;
        },
        easing: config.easing,
      });
    },
    hide: () => {
      return animate(cards, {
        translateY: [0, 20],
        opacity: [1, 0],
        duration: config.duration,
        delay: function(el, i) {
          return i * config.delay;
        },
        easing: 'easeInQuint',
      });
    }
  };
};

/**
 * Creates an expansion animation for a card
 * @param {HTMLElement} card - The card element to animate
 * @param {HTMLElement} expandedContent - The content to show when expanded
 * @param {Object} options - Animation options
 * @returns {Object} - Animation controller
 */
export const cardExpandEffect = (card, expandedContent, options = {}) => {
  const defaults = {
    duration: 500,
    easing: 'easeOutExpo',
    expandedHeight: 'auto',
  };

  const config = { ...defaults, ...options };
  let isExpanded = false;
  
  // Set initial styles
  expandedContent.style.overflow = 'hidden';
  expandedContent.style.height = '0';
  expandedContent.style.opacity = '0';
  
  return {
    toggle: () => {
      isExpanded = !isExpanded;
      
      if (isExpanded) {
        // Measure content height first if needed
        let targetHeight = config.expandedHeight;
        if (targetHeight === 'auto') {
          expandedContent.style.height = 'auto';
          expandedContent.style.visibility = 'hidden';
          expandedContent.style.display = 'block';
          targetHeight = expandedContent.offsetHeight + 'px';
          expandedContent.style.height = '0';
          expandedContent.style.visibility = 'visible';
        }
        
        // Expand animation
        return animate(expandedContent, {
          height: targetHeight,
          opacity: 1,
          duration: config.duration,
          easing: config.easing,
        });
      } else {
        // Collapse animation
        return animate(expandedContent, {
          height: 0,
          opacity: 0,
          duration: config.duration,
          easing: config.easing,
        });
      }
    },
    isExpanded: () => isExpanded
  };
};

/**
 * Creates a card shuffle animation for a group of cards
 * @param {NodeList|Array} cards - Collection of card elements
 * @param {Object} options - Animation options
 * @returns {Function} - Function to shuffle the cards
 */
export const cardShuffleEffect = (cards, options = {}) => {
  const defaults = {
    duration: 800,
    easing: 'easeOutExpo',
    delay: 30,
  };

  const config = { ...defaults, ...options };
  const container = cards[0].parentElement;
  const positions = [];
  
  // Store original positions
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    positions.push({
      top: rect.top - container.getBoundingClientRect().top,
      left: rect.left - container.getBoundingClientRect().left,
    });
  });
  
  return () => {
    // Randomize card order
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    
    // Animate cards to new positions
    cards.forEach((card, index) => {
      const newPosition = shuffledPositions[index];
      const currentRect = card.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const currentLeft = currentRect.left - containerRect.left;
      const currentTop = currentRect.top - containerRect.top;
      
      animate(card, {
        translateX: [0, newPosition.left - currentLeft],
        translateY: [0, newPosition.top - currentTop],
        duration: config.duration,
        delay: index * config.delay,
        easing: config.easing,
      });
    });
  };
};