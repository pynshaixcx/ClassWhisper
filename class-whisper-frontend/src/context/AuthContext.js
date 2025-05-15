// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../api/auth';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      await AuthService.login(email, password);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.register(userData);
      setError(null);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    AuthService.logout();
    setUser(null);
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    
    switch (role) {
      case 'student':
        return user.is_student;
      case 'faculty':
        return user.is_faculty || user.is_admin;
      case 'admin':
        return user.is_admin;
      default:
        return false;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.is_student || false,
    isFaculty: user?.is_faculty || false,
    isAdmin: user?.is_admin || false,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};