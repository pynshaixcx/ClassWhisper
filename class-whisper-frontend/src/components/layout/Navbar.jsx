// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animate, createScope } from '../../animations';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Logo3D from '../3d/Logo3D';
import './Navbar.scss';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Refs
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const animationScope = useRef(null);
  
  // Setup animations
  useEffect(() => {
    if (!navbarRef.current) return;
    
    // Create animation scope for navbar
    animationScope.current = createScope({ root: navbarRef }).add(self => {
      // Add menu open animation
      self.add('openMenu', () => {
        animate(menuRef.current, {
          translateY: ['-100%', '0%'],
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutExpo'
        });
      });
      
      // Add menu close animation
      self.add('closeMenu', () => {
        animate(menuRef.current, {
          translateY: ['0%', '-100%'],
          opacity: [1, 0],
          duration: 400,
          easing: 'easeInExpo'
        });
      });
      
      // Add user menu open animation
      self.add('openUserMenu', () => {
        animate(userMenuRef.current, {
          scaleY: [0, 1],
          opacity: [0, 1],
          duration: 300,
          easing: 'easeOutQuad',
          transformOrigin: 'top'
        });
      });
      
      // Add user menu close animation
      self.add('closeUserMenu', () => {
        animate(userMenuRef.current, {
          scaleY: [1, 0],
          opacity: [1, 0],
          duration: 200,
          easing: 'easeInQuad',
          transformOrigin: 'top'
        });
      });
      
      // Add scroll animation
      self.add('scrolled', (isScrolled) => {
        animate(navbarRef.current, {
          backgroundColor: isScrolled ? 'rgba(var(--color-bg-rgb), 0.8)' : 'rgba(var(--color-bg-rgb), 0)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
          boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
          height: isScrolled ? '70px' : '80px',
          duration: 300,
          easing: 'easeOutQuad'
        });
      });
    });
    
    // Clean up
    return () => {
      if (animationScope.current) {
        animationScope.current.revert();
      }
    };
  }, []);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
        
        // Animate navbar appearance
        if (animationScope.current) {
          animationScope.current.methods.scrolled(isScrolled);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Close menus when route changes
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);
  
  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu when clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        if (userMenuOpen) {
          setUserMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);
  
  // Toggle menus with animations
  const toggleMenu = () => {
    if (!animationScope.current) return;
    
    if (menuOpen) {
      animationScope.current.methods.closeMenu();
      setTimeout(() => setMenuOpen(false), 400);
    } else {
      setMenuOpen(true);
      setTimeout(() => animationScope.current.methods.openMenu(), 10);
    }
  };
  
  const toggleUserMenu = () => {
    if (!animationScope.current) return;
    
    if (userMenuOpen) {
      animationScope.current.methods.closeUserMenu();
      setTimeout(() => setUserMenuOpen(false), 200);
    } else {
      setUserMenuOpen(true);
      setTimeout(() => animationScope.current.methods.openUserMenu(), 10);
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Render navigation links based on user role
  const renderNavLinks = () => {
    const links = [];
    
    // Add common links
    links.push(
      <li key="home" className={location.pathname === '/' ? 'active' : ''}>
        <Link to="/">Home</Link>
      </li>
    );
    
    if (isAuthenticated) {
      // Add role-specific links
      if (user?.is_student) {
        links.push(
          <li key="dashboard" className={location.pathname.includes('/feedback/dashboard') ? 'active' : ''}>
            <Link to="/feedback/dashboard">My Feedback</Link>
          </li>,
          <li key="submit" className={location.pathname.includes('/feedback/create') ? 'active' : ''}>
            <Link to="/feedback/create">Submit Feedback</Link>
          </li>
        );
      } else if (user?.is_faculty) {
        links.push(
          <li key="dashboard" className={location.pathname.includes('/faculty/dashboard') ? 'active' : ''}>
            <Link to="/faculty/dashboard">Dashboard</Link>
          </li>,
          <li key="moderation" className={location.pathname.includes('/moderation') ? 'active' : ''}>
            <Link to="/moderation/queue">Moderation</Link>
          </li>
        );
      } else if (user?.is_admin) {
        links.push(
          <li key="dashboard" className={location.pathname.includes('/admin/dashboard') ? 'active' : ''}>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>,
          <li key="departments" className={location.pathname.includes('/admin/departments') ? 'active' : ''}>
            <Link to="/admin/departments">Departments</Link>
          </li>,
          <li key="users" className={location.pathname.includes('/admin/users') ? 'active' : ''}>
            <Link to="/admin/users">Users</Link>
          </li>
        );
      }
    }
    
    return links;
  };
  
  return (
    <header ref={navbarRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <div className="logo-container">
              <Logo3D text="CW" size={0.8} interactive={false} />
            </div>
            <div className="brand-text">Class Whisper</div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="navbar-nav desktop-nav">
            <ul>
              {renderNavLinks()}
            </ul>
          </nav>
          
          {/* Authentication and Theme Controls */}
          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <span className="icon">
                {theme === 'dark' ? (
                  <i className="fas fa-sun"></i>
                ) : (
                  <i className="fas fa-moon"></i>
                )}
              </span>
            </button>
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="user-menu-container">
                <button 
                  className="user-menu-button" 
                  onClick={toggleUserMenu}
                  aria-expanded={userMenuOpen}
                >
                  <div className="user-avatar">
                    {user?.first_name ? user.first_name.charAt(0) : user?.username.charAt(0)}
                  </div>
                  <span className="user-name">{user?.first_name || user?.username}</span>
                  <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'}`}></i>
                </button>
                
                {userMenuOpen && (
                  <div ref={userMenuRef} className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-info">
                        <div className="user-name">{user?.first_name} {user?.last_name}</div>
                        <div className="user-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="user-dropdown-body">
                      <Link to="/accounts/profile" className="dropdown-item">
                        <i className="fas fa-user"></i>
                        Profile
                      </Link>
                      <Link to="/accounts/settings" className="dropdown-item">
                        <i className="fas fa-cog"></i>
                        Settings
                      </Link>
                    </div>
                    <div className="user-dropdown-footer">
                      <button onClick={handleLogout} className="dropdown-item">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    leftIcon={<i className="fas fa-sign-in-alt"></i>}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<i className="fas fa-user-plus"></i>}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className={`menu-toggle ${menuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {menuOpen && (
            <div ref={menuRef} className="mobile-menu">
              <nav className="navbar-nav">
                <ul>
                  {renderNavLinks()}
                </ul>
              </nav>
              
              {!isAuthenticated && (
                <div className="mobile-auth">
                  <Link to="/login" className="btn btn-secondary btn-block">
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-block">
                    <i className="fas fa-user-plus"></i>
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;