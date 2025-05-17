// src/animations/scrollAnimations.js
import { animate, stagger, createScope } from 'animejs';

/**
 * Creates scroll-based animations for elements
 * @param {Object} options - Global configuration options
 * @returns {Object} - Scroll animation utilities
 */
export const createScrollAnimations = (options = {}) => {
  const defaults = {
    // Default threshold values for when animations trigger (0-1)
    thresholdStart: 0.1, // When to start animation (10% of element visible)
    thresholdEnd: 0.5,   // When to complete animation (50% of element visible)
    
    // Default animation values
    duration: 800,
    easing: 'easeOutQuint',
    
    // Default animation for reveal
    defaultAnimation: 'fadeUp',
    
    // Default delay options
    staggerDelay: 100,
    
    // Whether to play animations only once
    once: true,
    
    // Root margin for Intersection Observer
    rootMargin: '0px 0px -10% 0px'
  };

  const config = { ...defaults, ...options };
  
  // Keep track of observed elements
  const observedElements = new Map();
  
  // Animation presets
  const animationPresets = {
    // Fade in from bottom
    fadeUp: (element) => {
      return animate(element, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Fade in from left
    fadeLeft: (element) => {
      return animate(element, {
        opacity: [0, 1],
        translateX: [-50, 0],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Fade in from right
    fadeRight: (element) => {
      return animate(element, {
        opacity: [0, 1],
        translateX: [50, 0],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Zoom in
    zoomIn: (element) => {
      return animate(element, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Zoom out
    zoomOut: (element) => {
      return animate(element, {
        opacity: [0, 1],
        scale: [1.2, 1],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Reveal with clip path
    clipReveal: (element) => {
      element.style.clipPath = 'inset(0 0 100% 0)';
      element.style.opacity = '1';
      
      return animate(element, {
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
        duration: config.duration,
        easing: config.easing
      });
    },
    
    // Blur reveal
    blurReveal: (element) => {
      return animate(element, {
        opacity: [0, 1],
        filter: ['blur(10px)', 'blur(0px)'],
        duration: config.duration,
        easing: config.easing
      });
    }
  };
  
  // Create IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      const animationData = observedElements.get(element);
      
      if (!animationData) return;
      
      // If element is intersecting and hasn't played (if once=true)
      if (entry.isIntersecting && (!config.once || !animationData.played)) {
        // Mark as played if once=true
        if (config.once) {
          animationData.played = true;
        }
        
        // Get animation function
        const animationType = animationData.type || config.defaultAnimation;
        const animationFn = animationPresets[animationType];
        
        if (!animationFn) {
          console.warn(`Animation type "${animationType}" not found.`);
          return;
        }
        
        // Play the animation
        animationFn(element);
      } else if (!entry.isIntersecting && !config.once && animationData.played) {
        // Reset animations if not once=true and element is out of view
        element.style.opacity = '0';
        element.style.transform = '';
        animationData.played = false;
      }
    });
  }, {
    threshold: [config.thresholdStart, config.thresholdEnd],
    rootMargin: config.rootMargin
  });
  
  return {
    /**
     * Observe an element for scroll-based animation
     * @param {HTMLElement} element - Element to animate on scroll
     * @param {string} animationType - Type of animation to apply
     * @param {Object} elementOptions - Options specific to this element
     */
    observe: (element, animationType = config.defaultAnimation, elementOptions = {}) => {
      if (!element) return;
      
      // Set initial styles
      element.style.opacity = '0';
      
      // Add to tracked elements
      observedElements.set(element, {
        type: animationType,
        options: elementOptions,
        played: false
      });
      
      // Start observing
      observer.observe(element);
    },
    
    /**
     * Stop observing an element
     * @param {HTMLElement} element - Element to stop observing
     */
    unobserve: (element) => {
      if (!element) return;
      
      observer.unobserve(element);
      observedElements.delete(element);
    },
    
    /**
     * Observe and animate a set of elements with staggered delay
     * @param {NodeList|Array} elements - Collection of elements to animate
     * @param {string} animationType - Type of animation to apply
     * @param {Object} staggerOptions - Options for staggered animation
     */
    observeGroup: (elements, animationType = config.defaultAnimation, staggerOptions = {}) => {
      if (!elements || elements.length === 0) return;
      
      const staggerConfig = {
        delay: config.staggerDelay,
        from: 'start',
        ...staggerOptions
      };
      
      // Create IntersectionObserver for the group
      const groupObserver = new IntersectionObserver((entries) => {
        // Check if any element in the group is intersecting
        const isIntersecting = entries.some(entry => entry.isIntersecting);
        
        if (isIntersecting) {
          // Get all elements that aren't already animated
          const unplayedElements = Array.from(elements).filter(el => {
            const data = observedElements.get(el);
            return !data || !data.played;
          });
          
          if (unplayedElements.length === 0) return;
          
          // Get animation function
          const animationFn = animationPresets[animationType];
          
          if (!animationFn) {
            console.warn(`Animation type "${animationType}" not found.`);
            return;
          }
          
          // Set initial styles
          unplayedElements.forEach(el => {
            el.style.opacity = '0';
          });
          
          // Create staggered animation
          animate(unplayedElements, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: config.duration,
            delay: stagger(staggerConfig.delay, { from: staggerConfig.from }),
            easing: config.easing
          });
          
          // Mark as played if once=true
          if (config.once) {
            unplayedElements.forEach(el => {
              observedElements.set(el, {
                type: animationType,
                options: staggerOptions,
                played: true
              });
            });
            
            // Stop observing if all elements have been animated
            if (config.once && unplayedElements.length === elements.length) {
              Array.from(elements).forEach(el => {
                groupObserver.unobserve(el);
              });
            }
          }
        }
      }, {
        threshold: [config.thresholdStart],
        rootMargin: config.rootMargin
      });
      
      // Start observing all elements in the group
      Array.from(elements).forEach(el => {
        // Set initial styles
        el.style.opacity = '0';
        
        // Add to tracked elements
        observedElements.set(el, {
          type: animationType,
          options: staggerOptions,
          played: false
        });
        
        // Observe both with individual and group observer
        groupObserver.observe(el);
      });
    },
    
    /**
     * Create a parallax scroll effect
     * @param {HTMLElement} element - Element to apply parallax to
     * @param {Object} options - Parallax options
     */
    parallax: (element, options = {}) => {
      if (!element) return;
      
      const parallaxOptions = {
        speed: 0.5, // Parallax speed (0.5 = half-speed)
        direction: 'vertical', // 'vertical' or 'horizontal'
        reverse: false, // Whether to invert direction
        ...options
      };
      
      // Check if IntersectionObserver is available
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported in this browser. Parallax effects disabled.');
        return;
      }
      
      // Initial setup
      element.style.willChange = 'transform';
      
      // Create scroll handler
      const handleScroll = () => {
        // Check if element is in viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = (
          rect.bottom >= 0 &&
          rect.top <= (window.innerHeight || document.documentElement.clientHeight)
        );
        
        if (!isInViewport) return;
        
        // Calculate parallax offset
        const scrollPos = window.pageYOffset;
        const elementPos = element.getBoundingClientRect().top + scrollPos;
        const windowHeight = window.innerHeight;
        const elementHeight = element.offsetHeight;
        
        // Calculate how far the element is from the top of the viewport
        const relativePos = elementPos - scrollPos;
        const centerOffset = relativePos - (windowHeight / 2) + (elementHeight / 2);
        
        // Apply parallax transform
        const parallaxValue = centerOffset * parallaxOptions.speed * (parallaxOptions.reverse ? -1 : 1);
        
        if (parallaxOptions.direction === 'horizontal') {
          element.style.transform = `translateX(${parallaxValue}px)`;
        } else {
          element.style.transform = `translateY(${parallaxValue}px)`;
        }
      };
      
      // Throttle scroll handler for performance
      let ticking = false;
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
        }
        ticking = true;
      };
      
      // Add scroll listener
      window.addEventListener('scroll', requestTick, { passive: true });
      
      // Initial calculation
      handleScroll();
      
      // Return cleanup function
      return () => {
        window.removeEventListener('scroll', requestTick);
      };
    },
    
    /**
     * Create a scroll-based progress animation
     * @param {HTMLElement} element - Element to observe
     * @param {Function} onProgress - Callback with progress value (0-1)
     * @param {Object} options - Progress options
     */
    scrollProgress: (element, onProgress, options = {}) => {
      if (!element || typeof onProgress !== 'function') return;
      
      const progressOptions = {
        start: 'top-bottom', // When to start (element top at viewport bottom)
        end: 'bottom-top',   // When to end (element bottom at viewport top)
        smooth: 0.1,         // Smoothing factor (0 = no smoothing, 1 = max smoothing)
        ...options
      };
      
      let currentProgress = 0;
      let targetProgress = 0;
      let rafId = null;
      
      // Parse position strings
      const parsePosition = (posString) => {
        const [elementPos, viewportPos] = posString.split('-');
        return { elementPos, viewportPos };
      };
      
      // Calculate current progress based on scroll position
      const calculateProgress = () => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const startPos = parsePosition(progressOptions.start);
        const endPos = parsePosition(progressOptions.end);
        
        // Calculate start and end points
        let startY, endY;
        
        // Start position
        if (startPos.elementPos === 'top') {
          startY = rect.top;
        } else {
          startY = rect.bottom;
        }
        
        if (startPos.viewportPos === 'top') {
          startY -= 0;
        } else {
          startY -= windowHeight;
        }
        
        // End position
        if (endPos.elementPos === 'top') {
          endY = rect.top;
        } else {
          endY = rect.bottom;
        }
        
        if (endPos.viewportPos === 'top') {
          endY -= 0;
        } else {
          endY -= windowHeight;
        }
        
        // Calculate progress
        const total = startY - endY;
        const current = startY;
        const rawProgress = 1 - (current / total);
        
        // Clamp progress between 0 and 1
        return Math.max(0, Math.min(1, rawProgress));
      };
      
      // Smooth the progress value
      const smoothProgress = () => {
        // Calculate difference between current and target progress
        const diff = targetProgress - currentProgress;
        
        // If difference is very small, just set to target
        if (Math.abs(diff) < 0.001) {
          currentProgress = targetProgress;
          onProgress(currentProgress);
          rafId = null;
          return;
        }
        
        // Apply smoothing
        currentProgress += diff * (1 - progressOptions.smooth);
        
        // Call the progress callback
        onProgress(currentProgress);
        
        // Request next frame
        rafId = requestAnimationFrame(smoothProgress);
      };
      
      // Update progress on scroll
      const handleScroll = () => {
        targetProgress = calculateProgress();
        
        // Start smoothing animation if not already running
        if (rafId === null) {
          rafId = requestAnimationFrame(smoothProgress);
        }
      };
      
      // Add scroll listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initial calculation
      handleScroll();
      
      // Return cleanup function
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    },
    
    // Add custom animation presets
    addAnimationPreset: (name, animationFn) => {
      if (typeof animationFn !== 'function') {
        console.warn('Animation preset must be a function');
        return;
      }
      
      animationPresets[name] = animationFn;
    },
    
    // Get animation presets
    getAnimationPresets: () => {
      return Object.keys(animationPresets);
    },
    
    // Clean up all observers
    destroy: () => {
      observedElements.forEach((_, element) => {
        observer.unobserve(element);
      });
      
      observedElements.clear();
    }
  };
};

/**
 * Creates a scroll-triggered animation controller for a single page
 * @param {Object} options - Configuration options
 * @returns {Object} - Scroll animation controller for the page
 */
export const createPageScrollAnimations = (options = {}) => {
  const scrollAnimations = createScrollAnimations(options);
  const animatedElements = new Set();
  
  return {
    /**
     * Initialize scroll animations for elements with data attributes
     * @param {HTMLElement} rootElement - Root element to search within (defaults to document)
     */
    init: (rootElement = document) => {
      // Find elements with data-animate attribute
      const elements = rootElement.querySelectorAll('[data-animate]');
      
      elements.forEach(element => {
        // Get animation type from data attribute
        const animationType = element.dataset.animate || 'fadeUp';
        
        // Get animation options
        const delay = element.dataset.animateDelay ? parseInt(element.dataset.animateDelay, 10) : 0;
        const duration = element.dataset.animateDuration ? parseInt(element.dataset.animateDuration, 10) : undefined;
        const threshold = element.dataset.animateThreshold ? parseFloat(element.dataset.animateThreshold) : undefined;
        
        // Compile options
        const elementOptions = { delay };
        if (duration) elementOptions.duration = duration;
        if (threshold) elementOptions.threshold = threshold;
        
        // Add to animation controller
        scrollAnimations.observe(element, animationType, elementOptions);
        animatedElements.add(element);
      });
      
      // Find grouped animations
      const groupSelectors = new Set();
      const groupedElements = rootElement.querySelectorAll('[data-animate-group]');
      
      groupedElements.forEach(element => {
        const groupName = element.dataset.animateGroup;
        if (groupName) {
          groupSelectors.add(groupName);
        }
      });
      
      // Initialize each animation group
      groupSelectors.forEach(selector => {
        const groupElements = rootElement.querySelectorAll(`[data-animate-group="${selector}"]`);
        if (groupElements.length > 0) {
          // Get group options from the first element
          const firstElement = groupElements[0];
          const animationType = firstElement.dataset.animate || 'fadeUp';
          const staggerDelay = firstElement.dataset.animateStagger ? parseInt(firstElement.dataset.animateStagger, 10) : 100;
          const from = firstElement.dataset.animateFrom || 'start';
          
          // Initialize group animation
          scrollAnimations.observeGroup(groupElements, animationType, { delay: staggerDelay, from });
          groupElements.forEach(el => animatedElements.add(el));
        }
      });
      
      // Find parallax elements
      const parallaxElements = rootElement.querySelectorAll('[data-parallax]');
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.parallaxSpeed ? parseFloat(element.dataset.parallaxSpeed) : 0.5;
        const direction = element.dataset.parallaxDirection || 'vertical';
        const reverse = element.dataset.parallaxReverse === 'true';
        
        scrollAnimations.parallax(element, { speed, direction, reverse });
        animatedElements.add(element);
      });
    },
    
    /**
     * Clean up all animations
     */
    destroy: () => {
      animatedElements.forEach(element => {
        scrollAnimations.unobserve(element);
      });
      
      animatedElements.clear();
      scrollAnimations.destroy();
    }
  };
};

/**
 * Hook up scroll animations to elements via class names
 * Useful for adding animations without custom JS
 */
export const initializeScrollAnimations = () => {
  const controller = createPageScrollAnimations();
  
  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      controller.init();
    });
  } else {
    controller.init();
  }
  
  // Return controller for potential cleanup
  return controller;
};

/**
 * Create a scroll-driven navigation indicator
 * @param {HTMLElement} navElement - Navigation container
 * @param {NodeList|Array} sections - Sections to track
 * @param {Object} options - Configuration options
 */
export const createScrollSpy = (navElement, sections, options = {}) => {
  if (!navElement || !sections || sections.length === 0) return;
  
  const config = {
    activeClass: 'active',
    threshold: 0.3,
    navLinkSelector: 'a',
    smoothScroll: true,
    offset: 0,
    ...options
  };
  
  // Find navigation links
  const navLinks = navElement.querySelectorAll(config.navLinkSelector);
  
  // Create intersection observer for sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Find the nav link that corresponds to this section
      const targetId = entry.target.id;
      const navLink = Array.from(navLinks).find(link => {
        const href = link.getAttribute('href');
        return href === `#${targetId}` || href.endsWith(`#${targetId}`);
      });
      
      if (navLink) {
        if (entry.isIntersecting) {
          // Add active class
          navLinks.forEach(link => link.classList.remove(config.activeClass));
          navLink.classList.add(config.activeClass);
        }
      }
    });
  }, {
    threshold: config.threshold,
    rootMargin: `${-config.offset}px 0px 0px 0px`
  });
  
  // Start observing each section
  Array.from(sections).forEach(section => {
    observer.observe(section);
  });
  
  // Add smooth scrolling if enabled
  if (config.smoothScroll) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const targetId = href.includes('#') ? href.split('#')[1] : '';
        
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            e.preventDefault();
            
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - config.offset;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  // Return cleanup function
  return () => {
    Array.from(sections).forEach(section => {
      observer.unobserve(section);
    });
  };
};