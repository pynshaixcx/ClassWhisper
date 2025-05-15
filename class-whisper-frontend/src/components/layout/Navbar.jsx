// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import GlassButton from '../../common/GlassButton';
import './Navbar.scss';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isFaculty, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Render nav links based on user role
  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
        </>
      );
    }
    
    if (isStudent) {
      return (
        <>
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className={`nav-item ${isActive('/feedback/dashboard') ? 'active' : ''}`}>
            <Link to="/feedback/dashboard" className="nav-link">My Feedback</Link>
          </li>
          <li className={`nav-item ${isActive('/feedback/create') ? 'active' : ''}`}>
            <Link to="/feedback/create" className="nav-link">Submit Feedback</Link>
          </li>
        </>
      );
    }
    
    if (isFaculty) {
      return (
        <>
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className={`nav-item ${isActive('/faculty/dashboard') ? 'active' : ''}`}>
            <Link to="/faculty/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className={`nav-item ${isActive('/moderation/queue') ? 'active' : ''}`}>
            <Link to="/moderation/queue" className="nav-link">Moderation</Link>
          </li>
          <li className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>
            <Link to="/analytics" className="nav-link">Analytics</Link>
          </li>
        </>
      );
    }
    
    if (isAdmin) {
      return (
        <>
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className={`nav-item dropdown`}>
            <button 
              className="nav-link dropdown-toggle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Management
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div 
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/admin/departments" className="dropdown-item">Departments</Link>
                  <Link to="/admin/users" className="dropdown-item">Users</Link>
                  <Link to="/moderation/filter-rules" className="dropdown-item">Filter Rules</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>
            <Link to="/analytics" className="nav-link">Analytics</Link>
          </li>
        </>
      );
    }
    
    return null;
  };
  
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo">CW</span>
          <span className="brand-text">Class Whisper</span>
        </Link>
        
        <div className="navbar-right">
          {/* Desktop Navigation */}
          <ul className="navbar-nav desktop-nav">
            {renderNavLinks()}
          </ul>
          
          {/* Authentication Links */}
          <div className="auth-buttons">
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-menu-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <span className="user-name">{user?.first_name || user?.username}</span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/accounts/profile" className="dropdown-item">Profile</Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <GlassButton variant="secondary" size="sm">Login</GlassButton>
                </Link>
                <Link to="/register">
                  <GlassButton variant="primary" size="sm">Register</GlassButton>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="navbar-nav">
                {renderNavLinks()}
                
                {/* Mobile auth links */}
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link to="/accounts/profile" className="nav-link">Profile</Link>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link logout-button" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link to="/login" className="nav-link">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/register" className="nav-link">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;