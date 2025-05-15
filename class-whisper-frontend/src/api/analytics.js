// src/api/analytics.js
import axios from './axios';

/**
 * Service for Analytics API interactions
 */
const AnalyticsService = {
  // Get dashboard data
  getDashboardData: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.department) queryParams.append('department', params.department);
      if (params.days) queryParams.append('days', params.days);
      
      const url = `analytics/dashboard/?${queryParams.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all reports
  getReports: async () => {
    try {
      const response = await axios.get('reports/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get report by ID
  getReport: async (id) => {
    try {
      const response = await axios.get(`reports/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new report
  createReport: async (reportData) => {
    try {
      const response = await axios.post('reports/', reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Export report as CSV
  exportReport: async (id) => {
    try {
      const response = await axios.get(`reports/${id}/export/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user's dashboard widgets
  getWidgets: async () => {
    try {
      const response = await axios.get('widgets/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new widget
  createWidget: async (widgetData) => {
    try {
      const response = await axios.post('widgets/', widgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update widget
  updateWidget: async (id, widgetData) => {
    try {
      const response = await axios.put(`widgets/${id}/`, widgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete widget
  deleteWidget: async (id) => {
    try {
      await axios.delete(`widgets/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Reorder widgets
  reorderWidgets: async (positionData) => {
    try {
      const response = await axios.post('widgets/reorder/', positionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AnalyticsService;