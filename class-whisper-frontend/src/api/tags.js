// src/api/tags.js
import axios from './axios';

/**
 * Service for Tag API interactions
 */
const TagService = {
  // Get all tags
  getAllTags: async () => {
    try {
      const response = await axios.get('tags/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get department tags
  getDepartmentTags: async (departmentId) => {
    try {
      const response = await axios.get(`tags/?department=${departmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new tag
  createTag: async (tagData) => {
    try {
      const response = await axios.post('tags/', tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update tag
  updateTag: async (id, tagData) => {
    try {
      const response = await axios.put(`tags/${id}/`, tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete tag
  deleteTag: async (id) => {
    try {
      await axios.delete(`tags/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default TagService;