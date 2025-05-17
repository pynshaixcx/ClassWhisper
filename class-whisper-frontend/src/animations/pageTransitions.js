// src/animations/pageTransitions.js
import { animate, createScope, stagger } from 'animejs';

/**
 * Creates page transition animations for route changes
 * @param {Object} options - Configuration options
 * @returns {Object} - Page transition controllers
 */
export const createPageTransitions = (options = {}) => {
  const defaults = {
    duration: 800,
    exitDuration: 600,
    easing: 'easeOutExpo',
    exitEasing: 'easeInExpo',
    staggerDelay: 50,
  };

  const config = { ...defaults, ...options };

  // Page transition effects
  return {
    /**
     * Fade transition - simple opacity fade
     */
    fade: {
      // Enter animation
      enter: (container, done) => {
        return animate(container, {
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation
      exit: (container, done) => {
        return animate(container, {
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Slide transition - horizontal slide effect
     */
    slide: {
      // Enter animation
      enter: (container, done, direction = 'right') => {
        const x = direction === 'right' ? [100, 0] : [-100, 0];
        return animate(container, {
          translateX: x,
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation
      exit: (container, done, direction = 'left') => {
        const x = direction === 'left' ? [0, -100] : [0, 100];
        return animate(container, {
          translateX: x,
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Zoom transition - zoom in/out effect
     */
    zoom: {
      // Enter animation
      enter: (container, done) => {
        return animate(container, {
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation
      exit: (container, done) => {
        return animate(container, {
          scale: [1, 0.8],
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Flip transition - 3D flip effect
     */
    flip: {
      // Enter animation
      enter: (container, done, direction = 'y') => {
        // Set perspective on parent
        const parent = container.parentElement;
        if (parent) {
          parent.style.perspective = '1000px';
        }
        
        const rotation = direction === 'y' ? 'rotateY' : 'rotateX';
        const startValue = direction === 'y' ? 90 : -90;
        
        return animate(container, {
          [rotation]: [startValue, 0],
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation
      exit: (container, done, direction = 'y') => {
        // Set perspective on parent
        const parent = container.parentElement;
        if (parent) {
          parent.style.perspective = '1000px';
        }
        
        const rotation = direction === 'y' ? 'rotateY' : 'rotateX';
        const endValue = direction === 'y' ? -90 : 90;
        
        return animate(container, {
          [rotation]: [0, endValue],
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Staggered items transition - for animating lists of elements
     */
    staggered: {
      // Enter animation for children inside container
      enter: (container, done, selector = '.animate-item') => {
        const items = container.querySelectorAll(selector);
        
        // Animate container first
        animate(container, {
          opacity: [0, 1],
          duration: 300,
          easing: 'easeOutQuad'
        });
        
        // Then animate children with stagger
        return animate(items, {
          translateY: [20, 0],
          opacity: [0, 1],
          delay: stagger(config.staggerDelay),
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation for children inside container
      exit: (container, done, selector = '.animate-item') => {
        const items = container.querySelectorAll(selector);
        
        // Animate children first
        animate(items, {
          translateY: [0, 20],
          opacity: [1, 0],
          delay: stagger(config.staggerDelay, { direction: 'reverse' }),
          duration: config.exitDuration / 2,
          easing: config.exitEasing,
        });
        
        // Then animate container
        return animate(container, {
          opacity: [1, 0],
          duration: config.exitDuration / 2,
          delay: items.length * config.staggerDelay * 0.5,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Slide up transition - vertical slide effect
     */
    slideUp: {
      // Enter animation
      enter: (container, done) => {
        return animate(container, {
          translateY: [50, 0],
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: done
        });
      },
      // Exit animation
      exit: (container, done) => {
        return animate(container, {
          translateY: [0, -50],
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        });
      }
    },

    /**
     * Clip transition - uses clip-path for revealing content
     */
    clip: {
      // Enter animation
      enter: (container, done, direction = 'vertical') => {
        // Set initial clip-path
        container.style.clipPath = direction === 'vertical' 
          ? 'inset(50% 0 50% 0)' 
          : 'inset(0 50% 0 50%)';
        
        const keyframes = {
          clipPath: direction === 'vertical'
            ? ['inset(50% 0 50% 0)', 'inset(0 0 0 0)']
            : ['inset(0 50% 0 50%)', 'inset(0 0 0 0)'],
          opacity: [0, 1],
          duration: config.duration,
          easing: config.easing,
          complete: () => {
            container.style.clipPath = 'none';
            if (done) done();
          }
        };
        
        return animate(container, keyframes);
      },
      // Exit animation
      exit: (container, done, direction = 'vertical') => {
        const keyframes = {
          clipPath: direction === 'vertical'
            ? ['inset(0 0 0 0)', 'inset(50% 0 50% 0)']
            : ['inset(0 0 0 0)', 'inset(0 50% 0 50%)'],
          opacity: [1, 0],
          duration: config.exitDuration,
          easing: config.exitEasing,
          complete: done
        };
        
        return animate(container, keyframes);
      }
    }
  };
};

/**
 * Helper to create route transition manager for React Router
 * @param {Object} transitions - Transition effects to use
 * @returns {Object} - Route transition manager
 */
export const createRouteTransitionManager = (transitions) => {
  let activeTransition = null;
  let defaultTransition = 'fade';
  
  // Create a mapping of route patterns to transitions
  let routeTransitionMap = {};
  
  return {
    /**
     * Set the default transition for all routes
     * @param {string} transitionName - Name of the transition to use
     */
    setDefaultTransition: (transitionName) => {
      if (transitions[transitionName]) {
        defaultTransition = transitionName;
      } else {
        console.warn(`Transition '${transitionName}' not found. Using 'fade' instead.`);
      }
    },
    
    /**
     * Define a specific transition for a route pattern
     * @param {string|RegExp} routePattern - Route pattern to match
     * @param {string} transitionName - Name of the transition to use
     */
    setRouteTransition: (routePattern, transitionName) => {
      if (!transitions[transitionName]) {
        console.warn(`Transition '${transitionName}' not found. Using default instead.`);
        transitionName = defaultTransition;
      }
      
      routeTransitionMap[routePattern] = transitionName;
    },
    
    /**
     * Get the appropriate transition for a route
     * @param {string} route - Current route path
     * @returns {string} - Transition name to use
     */
    getTransitionForRoute: (route) => {
      // Check for exact matches first
      if (routeTransitionMap[route]) {
        return routeTransitionMap[route];
      }
      
      // Check for regexp patterns
      for (const pattern in routeTransitionMap) {
        if (pattern instanceof RegExp && pattern.test(route)) {
          return routeTransitionMap[pattern];
        }
        
        // Handle simple glob patterns (convert * to .*)
        if (typeof pattern === 'string' && pattern.includes('*')) {
          const regexPattern = new RegExp(pattern.replace(/\*/g, '.*'));
          if (regexPattern.test(route)) {
            return routeTransitionMap[pattern];
          }
        }
      }
      
      // Fall back to default
      return defaultTransition;
    },
    
    /**
     * Execute a transition between routes
     * @param {string} route - Target route
     * @param {HTMLElement} container - Container element to animate
     * @param {Function} done - Callback when transition is complete
     * @param {Object} options - Additional options for the transition
     */
    transition: (route, container, done, options = {}) => {
      // Cancel any active transition
      if (activeTransition && activeTransition.pause) {
        activeTransition.pause();
      }
      
      // Determine which transition to use
      const transitionName = this.getTransitionForRoute(route);
      const transition = transitions[transitionName] || transitions[defaultTransition];
      
      // Apply the transition
      if (options.isEntering) {
        activeTransition = transition.enter(container, done, options.direction);
      } else {
        activeTransition = transition.exit(container, done, options.direction);
      }
      
      return activeTransition;
    }
  };
};

/**
 * Create a pre-configured page transition controller
 * @param {HTMLElement} container - The page container element
 * @returns {Object} - Page transition controller
 */
export const createPageTransitionController = (container) => {
  if (!container) {
    console.warn('Page container element is required for transitions');
    return null;
  }
  
  const scope = createScope({ root: container });
  const transitions = createPageTransitions();
  
  // Add transition methods to scope
  scope.add((self) => {
    self.add('fadeIn', (element) => {
      return transitions.fade.enter(element);
    });
    
    self.add('fadeOut', (element) => {
      return transitions.fade.exit(element);
    });
    
    self.add('slideInRight', (element) => {
      return transitions.slide.enter(element, null, 'right');
    });
    
    self.add('slideOutLeft', (element) => {
      return transitions.slide.exit(element, null, 'left');
    });
    
    self.add('slideInLeft', (element) => {
      return transitions.slide.enter(element, null, 'left');
    });
    
    self.add('slideOutRight', (element) => {
      return transitions.slide.exit(element, null, 'right');
    });
    
    self.add('zoomIn', (element) => {
      return transitions.zoom.enter(element);
    });
    
    self.add('zoomOut', (element) => {
      return transitions.zoom.exit(element);
    });
  });
  
  return {
    scope,
    transitions,
    cleanup: () => {
      scope.revert();
    }
  };
};