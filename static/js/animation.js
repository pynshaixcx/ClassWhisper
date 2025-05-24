/**
 * Class Whisper - 3D Animations and Transitions
 * This script handles all animation effects for the minimalist theme
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initPageTransitions();
    initCardEffects();
    initNavbarEffects();
    initStaggerAnimations();
    initParallaxEffects();
    init3DFeedbackCards();
  });
  
  /**
   * Initialize page transition effects
   */
  function initPageTransitions() {
    // Add page transition container class to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('page-transition-container');
      mainContent.classList.add('page-transition-enter');
      mainContent.classList.add('page-transition-enter-active');
      
      // Remove classes after animation completes
      setTimeout(() => {
        mainContent.classList.remove('page-transition-enter');
        mainContent.classList.remove('page-transition-enter-active');
      }, 500);
    }
    
    // Add fade-in animation to main heading
    const mainHeading = document.querySelector('main h2, main .display-4');
    if (mainHeading) {
      mainHeading.classList.add('fade-in');
    }
  }
  
  /**
   * Initialize 3D card hover effects
   */
  function initCardEffects() {
    // Add 3D tilt effect to cards
    const cards = document.querySelectorAll('.card:not(.no-tilt)');
    
    cards.forEach(card => {
      card.classList.add('card-3d');
      
      card.addEventListener('mousemove', function(e) {
        // Get card dimensions and position
        const rect = this.getBoundingClientRect();
        // Calculate mouse position relative to card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation values (max ±7.5 degrees)
        const rotateY = ((x / rect.width) - 0.5) * 7.5;
        const rotateX = ((y / rect.height) - 0.5) * -7.5;
        
        // Apply 3D transform
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Add subtle shadow offset based on tilt
        const shadowOffsetX = rotateY * 0.5;
        const shadowOffsetY = rotateX * -0.5;
        this.style.boxShadow = `${shadowOffsetX}px ${shadowOffsetY}px 20px rgba(0,0,0,0.1)`;
      });
      
      // Reset card on mouse leave
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        this.style.boxShadow = '';
        
        // Add smooth transition on mouse leave
        this.style.transition = 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
        
        // Remove transition after animation completes to keep hover smooth
        setTimeout(() => {
          this.style.transition = '';
        }, 500);
      });
    });
  }
  
  /**
   * Apply special effects to navbar
   */
  function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Track scroll position for navbar hide/show
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Show/hide navbar based on scroll direction
      if (scrollTop > lastScrollTop && scrollTop > 150) {
        // Scrolling down & not at the top - hide navbar
        navbar.classList.add('nav-hidden');
      } else {
        // Scrolling up or at the top - show navbar
        navbar.classList.remove('nav-hidden');
      }
      
      // Add shadow when scrolled
      if (scrollTop > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScrollTop = scrollTop;
    });
  }
  
  /**
   * Initialize staggered animations for groups of elements
   */
  function initStaggerAnimations() {
    // Find elements with stagger-fade-in class
    const staggerContainers = document.querySelectorAll('.stagger-fade-in');
    
    staggerContainers.forEach(container => {
      // Check if container is in viewport
      const checkIfInView = () => {
        const rect = container.getBoundingClientRect();
        const inView = (
          rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.bottom >= 0
        );
        
        if (inView && !container.classList.contains('animated')) {
          container.classList.add('animated');
        }
      };
      
      // Check on load and scroll
      checkIfInView();
      window.addEventListener('scroll', checkIfInView);
    });
  }
  
  /**
   * Add parallax scroll effects to elements
   */
  function initParallaxEffects() {
    // Find elements with parallax class
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.2;
        const offset = scrollTop * speed;
        element.style.transform = `translateY(${offset}px)`;
      });
    });
  }
  
  /**
   * Add special 3D effects to feedback cards
   */
  function init3DFeedbackCards() {
    // Apply to feedback cards in dashboard and list views
    const feedbackItems = document.querySelectorAll('.feedback-item, tr.feedback-row');
    
    feedbackItems.forEach((item, index) => {
      // Add animation delay based on index
      item.style.animationDelay = `${index * 0.05}s`;
      
      // Add animation class
      item.classList.add('fade-in');
      
      // Add click effect for feedback items
      item.addEventListener('click', function(e) {
        // Skip if clicking on a button or link
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
            e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        
        // Add pressed effect
        this.style.transform = 'scale(0.98)';
        
        // Reset after short delay
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      });
    });
  }
  
  /**
   * Add ripple effect to buttons
   */
  function addButtonRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const x = e.clientX - this.getBoundingClientRect().left;
        const y = e.clientY - this.getBoundingClientRect().top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  
  /**
   * Function to animate stats numbers
   */
  function animateNumbers() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(value => {
      const target = parseInt(value.textContent, 10);
      let current = 0;
      const increment = Math.max(1, Math.floor(target / 30)); // Ensure minimum increment of 1
      
      const updateValue = () => {
        current += increment;
        
        if (current >= target) {
          value.textContent = target;
        } else {
          value.textContent = current;
          requestAnimationFrame(updateValue);
        }
      };
      
      // Start with 0 and animate up
      value.textContent = '0';
      
      // Check if element is in viewport before animating
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(updateValue);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(value);
    });
  }
  
  // Initialize button ripple effect and number animation after page loads
  window.addEventListener('load', function() {
    addButtonRippleEffect();
    animateNumbers();
    
    // Add class to body to indicate JS is loaded and animations can run
    document.body.classList.add('js-loaded');
  });
  
  /**
   * Add smooth behavior for all internal links
   */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });