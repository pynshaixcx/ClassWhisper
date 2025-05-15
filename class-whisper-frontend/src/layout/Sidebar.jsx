// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.scss';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isAuthenticated, logout, isStudent, isFaculty, isAdmin } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Sidebar navigation items based on user role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/', icon: 'home', label: 'Home' },
        { path: '/login', icon: 'sign-in-alt', label: 'Login' },
        { path: '/register', icon: 'user-plus', label: 'Register' },
      ];
    }
    
    if (isStudent) {
      return [
        { path: '/', icon: 'home', label: 'Home' },
        { path: '/feedback/dashboard', icon: 'tachometer-alt', label: 'My Feedback' },
        { path: '/feedback/create', icon: 'edit', label: 'Submit Feedback' },
        { section: 'account', icon: 'user-circle', label: 'My Account', items: [
          { path: '/accounts/profile', icon: 'user', label: 'Profile' },
          { path: '/accounts/settings', icon: 'cog', label: 'Settings' },
        ]},
      ];
    }
    
    if (isFaculty) {
      return [
        { path: '/', icon: 'home', label: 'Home' },
        { path: '/faculty/dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
        { path: '/moderation/queue', icon: 'tasks', label: 'Moderation' },
        { path: '/analytics', icon: 'chart-line', label: 'Analytics' },
        { section: 'account', icon: 'user-circle', label: 'My Account', items: [
          { path: '/accounts/profile', icon: 'user', label: 'Profile' },
          { path: '/accounts/settings', icon: 'cog', label: 'Settings' },
        ]},
      ];
    }
    
    if (isAdmin) {
      return [
        { path: '/', icon: 'home', label: 'Home' },
        { path: '/admin/dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
        { section: 'management', icon: 'cogs', label: 'Management', items: [
          { path: '/admin/departments', icon: 'building', label: 'Departments' },
          { path: '/admin/users', icon: 'users', label: 'Users' },
          { path: '/moderation/filter-rules', icon: 'filter', label: 'Filter Rules' },
        ]},
        { path: '/moderation/queue', icon: 'tasks', label: 'Moderation' },
        { path: '/analytics', icon: 'chart-line', label: 'Analytics' },
        { section: 'account', icon: 'user-circle', label: 'My Account', items: [
          { path: '/accounts/profile', icon: 'user', label: 'Profile' },
          { path: '/accounts/settings', icon: 'cog', label: 'Settings' },
        ]},
      ];
    }
    
    return [];
  };
  
  const navItems = getNavItems();
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo">CW</span>
          <span className="brand-text">Class Whisper</span>
        </Link>
        <button className="sidebar-close" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="sidebar-content">
        {isAuthenticated && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.profile?.profile_picture ? (
                <img src={user.profile.profile_picture} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.first_name || user?.username}</div>
              <div className="user-role">
                {isAdmin ? 'Administrator' : isFaculty ? 'Faculty' : 'Student'}
              </div>
            </div>
          </div>
        )}
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item, index) => (
              <li key={index} className={`nav-item ${item.section && expandedSection === item.section ? 'expanded' : ''}`}>
                {item.section ? (
                  <>
                    <button 
                      className={`nav-link nav-section`}
                      onClick={() => toggleSection(item.section)}
                    >
                      <i className={`fas fa-${item.icon} nav-icon`}></i>
                      <span className="nav-label">{item.label}</span>
                      <i className={`fas fa-chevron-${expandedSection === item.section ? 'down' : 'right'} nav-arrow`}></i>
                    </button>
                    {expandedSection === item.section && (
                      <ul className="section-items">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex} className="section-item">
                            <Link 
                              to={subItem.path} 
                              className={`section-link ${isActive(subItem.path) ? 'active' : ''}`}
                            >
                              <i className={`fas fa-${subItem.icon} section-icon`}></i>
                              <span className="section-label">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <i className={`fas fa-${item.icon} nav-icon`}></i>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme}>
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
          <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
        
        {isAuthenticated && (
          <button className="logout-button" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;