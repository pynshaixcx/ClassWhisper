// src/api/moderation.js
import axios from './axios';

/**
 * Service for Moderation API interactions
 */
const ModerationService = {
  // Get moderation queue
  getModerationQueue: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.department) queryParams.append('department', params.department);
      if (params.q) queryParams.append('q', params.q);
      
      const url = `moderation/queue/?${queryParams.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Moderate feedback
  moderateFeedback: async (feedbackId, action, reason = '') => {
    try {
      const response = await axios.post(`moderation/moderate/${feedbackId}/`, {
        action,
        reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get filter rules
  getFilterRules: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      
      const url = `filter-rules/?${queryParams.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new filter rule
  createFilterRule: async (ruleData) => {
    try {
      const response = await axios.post('filter-rules/', ruleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update filter rule
  updateFilterRule: async (id, ruleData) => {
    try {
      const response = await axios.put(`filter-rules/${id}/`, ruleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete filter rule
  deleteFilterRule: async (id) => {
    try {
      await axios.delete(`filter-rules/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Toggle filter rule active status
  toggleFilterRule: async (id) => {
    try {
      const response = await axios.post(`filter-rules/${id}/toggle/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ModerationService;