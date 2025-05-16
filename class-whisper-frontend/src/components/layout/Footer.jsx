// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Footer.scss';

const Footer = () => {
  const { theme, toggleTheme, glassmorphismEnabled, toggleGlassmorphism } = useTheme();
  
  return (
    <footer className={`app-footer ${glassmorphismEnabled ? 'glass-nav' : ''}`}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo">CW</span>
              <span className="brand-text">Class Whisper</span>
            </Link>
            <p className="footer-tagline">
              Anonymous academic feedback platform
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-group">
              <h5>Platform</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/feedback/create">Submit Feedback</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-group">
              <h5>Account</h5>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/accounts/profile">Profile</Link></li>
                <li><Link to="/accounts/password-reset">Reset Password</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-group">
              <h5>Settings</h5>
              <ul>
                <li>
                  <button 
                    className="footer-theme-toggle"
                    onClick={toggleTheme}
                  >
                    <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'} me-2`}></i>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                <li>
                  <button 
                    className="footer-theme-toggle"
                    onClick={toggleGlassmorphism}
                  >
                    <i className={`fas fa-${glassmorphismEnabled ? 'toggle-on' : 'toggle-off'} me-2`}></i>
                    Glassmorphism {glassmorphismEnabled ? 'On' : 'Off'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Class Whisper. All rights reserved.
          </p>
          <div className="footer-social">
            <a href="https://github.com/pynshaixcx/ClassWhisper" className="social-link"><i className="fab fa-github"></i></a>
            <a href="https://twitter.com/classwhisper" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="https://linkedin.com/company/classwhisper" className="social-link"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;