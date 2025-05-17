// src/components/layout/Footer.jsx
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { animate, staggeredFadeIn } from '../../animations';
import './Footer.scss';

/**
 * Footer component for all pages
 */
const Footer = () => {
  const { theme, toggleTheme, glassmorphismEnabled, toggle3DAnimation } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Refs for animations
  const footerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Animation when component mounts
  useEffect(() => {
    if (!footerRef.current || !contentRef.current) return;
    
    // Animate footer items with staggered effect
    const footerElements = contentRef.current.querySelectorAll('.animate-item');
    staggeredFadeIn(footerElements, {
      duration: 800,
      delay: 100,
      easing: 'easeOutCubic'
    });
  }, []);
  
  // Build the current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer ref={footerRef} className="site-footer">
      <div className="footer-waves">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            className="wave-1"
            d="M0,224L40,213.3C80,203,160,181,240,186.7C320,192,400,224,480,224C560,224,640,192,720,186.7C800,181,880,203,960,208C1040,213,1120,203,1200,176C1280,149,1360,107,1400,85.3L1440,64L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
          <path 
            className="wave-2"
            d="M0,256L40,261.3C80,267,160,277,240,261.3C320,245,400,203,480,197.3C560,192,640,224,720,234.7C800,245,880,235,960,208C1040,181,1120,139,1200,133.3C1280,128,1360,160,1400,176L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      <div className="container">
        <div ref={contentRef} className="footer-content">
          <div className="footer-section brand animate-item">
            <div className="footer-logo">
              <img src="/logo.svg" alt="Class Whisper" />
              <h2 className="footer-brand">Class Whisper</h2>
            </div>
            <p className="footer-description">
              An anonymous academic feedback platform enabling constructive communication 
              between students and faculty for a better learning environment.
            </p>
            <div className="social-links">
              <a href="https://twitter.com/classwhisper" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://github.com/classwhisper" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/company/classwhisper" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-section links animate-item">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              {isAuthenticated ? (
                <li><Link to="/feedback/dashboard">My Dashboard</Link></li>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div className="footer-section features animate-item">
            <h3 className="footer-title">Features</h3>
            <ul className="footer-links">
              <li><Link to="/features/anonymous-feedback">Anonymous Feedback</Link></li>
              <li><Link to="/features/departments">Department Channels</Link></li>
              <li><Link to="/features/moderation">Moderation System</Link></li>
              <li><Link to="/features/analytics">Analytics Dashboard</Link></li>
              <li><Link to="/features/faculty-responses">Faculty Responses</Link></li>
            </ul>
          </div>
          
          <div className="footer-section contact animate-item">
            <h3 className="footer-title">Contact Us</h3>
            <p><i className="fas fa-envelope"></i> support@classwhisper.edu</p>
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Campus Drive, University City, CA 94123</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright animate-item">
            &copy; {currentYear} Class Whisper. All rights reserved.
          </div>
          
          <div className="footer-settings animate-item">
            <button 
              className="footer-setting-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <><i className="fas fa-sun"></i> Light Mode</>
              ) : (
                <><i className="fas fa-moon"></i> Dark Mode</>
              )}
            </button>
            
            <button 
              className="footer-setting-btn"
              onClick={toggle3DAnimation}
              aria-label="Toggle 3D effects"
            >
              <i className="fas fa-cube"></i> 3D Effects
            </button>
          </div>
          
          <div className="footer-legal animate-item">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;