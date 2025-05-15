// src/api/departments.js
import axios from './axios';

/**
 * Service for Department API interactions
 */
const DepartmentService = {
  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await axios.get('departments/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get department by ID
  getDepartment: async (id) => {
    try {
      const response = await axios.get(`departments/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await axios.post('departments/', departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await axios.put(`departments/${id}/`, departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete department
  deleteDepartment: async (id) => {
    try {
      await axios.delete(`departments/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Get department members
  getDepartmentMembers: async (id) => {
    try {
      const response = await axios.get(`departments/${id}/users/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default DepartmentService;