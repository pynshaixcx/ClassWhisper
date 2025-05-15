// src/api/feedback.js
import axios from './axios';

/**
 * Service for Feedback API interactions
 */
const FeedbackService = {
  // Get all feedback items for student dashboard
  getStudentFeedback: async (departmentId = null) => {
    let url = 'feedback/student_dashboard/';
    if (departmentId) {
      url += `?department=${departmentId}`;
    }
    const response = await axios.get(url);
    return response.data;
  },
  
  // Get student dashboard stats
  getStudentStats: async () => {
    const response = await axios.get('feedback/student_stats/');
    return response.data;
  },
  
  // Get all feedback items for faculty dashboard
  getFacultyFeedback: async (filters = {}) => {
    let url = 'feedback/faculty_dashboard/';
    
    // Add query params
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('q', filters.search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  },
  
  // Get feedback details by hash ID
  getFeedbackByHash: async (hashId) => {
    const response = await axios.get(`feedback/${hashId}/`);
    return response.data;
  },
  
  // Submit new feedback
  submitFeedback: async (feedbackData) => {
    const response = await axios.post('feedback/', feedbackData);
    return response.data;
  },
  
  // Add reply to feedback
  addReply: async (hashId, content) => {
    const response = await axios.post(`feedback/${hashId}/add_reply/`, { content });
    return response.data;
  },
  
  // Update feedback status
  updateStatus: async (hashId, status) => {
    const response = await axios.patch(`feedback/${hashId}/`, { status });
    return response.data;
  }
};

export default FeedbackService;