// src/api/auth.js
import axios from './axios';
import jwt_decode from 'jwt-decode';

/**
 * Service for Authentication API interactions
 */
const AuthService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post('auth/token/', {
        email,
        password
      });
      
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Return decoded user info
      return jwt_decode(access);
    } catch (error) {
      throw error;
    }
  },
  
  // Register user
  register: async (userData) => {
    try {
      const response = await axios.post('users/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      
      if (!refresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('auth/token/refresh/', {
        refresh
      });
      
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      
      return jwt_decode(access);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return null;
      }
      
      // Decode token to get user ID
      const decoded = jwt_decode(token);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        // Token expired, try to refresh
        return await AuthService.refreshToken();
      }
      
      // Get user details
      const response = await axios.get(`users/${decoded.user_id}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return false;
    }
    
    try {
      // Decode token to check expiration
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Return true if token is not expired
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
};

export default AuthService;