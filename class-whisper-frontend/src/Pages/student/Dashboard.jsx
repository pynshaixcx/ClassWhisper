// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeedbackService from '../../api/feedback';
import DepartmentService from '../../api/departments';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import '../../styles/Dashboard.scss';

const StudentDashboard = () => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    addressed: 0,
    rejected: 0
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load feedback data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get student dashboard data
        const feedbackResponse = await FeedbackService.getStudentFeedback(selectedDepartment);
        setFeedbackItems(feedbackResponse);
        
        // Get departments for filter
        const departmentsResponse = await DepartmentService.getAllDepartments();
        setDepartments(departmentsResponse);
        
        // Get dashboard stats
        const statsResponse = await FeedbackService.getStudentStats();
        setStats(statsResponse);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDepartment]);
  
  // Handle department filter change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  if (loading) {
    return <Loading fullScreen glass text="Loading your dashboard..." />;
  }
  
  return (
    <div className="dashboard student-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h2 className="dashboard-title">Student Dashboard</h2>
          <p className="dashboard-subtitle">
            Track and manage your feedback submissions
          </p>
          
          <div className="dashboard-actions">
            <Link to="/feedback/create">
              <GlassButton variant="primary">
                <i className="fas fa-plus"></i>
                Submit New Feedback
              </GlassButton>
            </Link>
            
            <div className="department-filter">
              <label htmlFor="department-select">Filter by Department:</label>
              <select
                id="department-select"
                className="form-select"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          <div className="stats-overview">
            <GlassCard className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-comment-alt"></i>
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Feedback</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon approved">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon addressed">
                <i className="fas fa-reply"></i>
              </div>
              <div className="stat-value">{stats.addressed}</div>
              <div className="stat-label">Addressed</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon rejected">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-value">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </GlassCard>
          </div>
          
          <h3 className="section-title">Your Feedback</h3>
          
          {feedbackItems.length === 0 ? (
            <GlassCard className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-comment-slash"></i>
              </div>
              <h4>No feedback found</h4>
              <p>
                {selectedDepartment
                  ? "You haven't submitted any feedback to this department yet."
                  : "You haven't submitted any feedback yet."}
              </p>
              <Link to="/feedback/create">
                <GlassButton variant="primary">
                  Submit Your First Feedback
                </GlassButton>
              </Link>
            </GlassCard>
          ) : (
            <motion.div
              className="feedback-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {feedbackItems.map(feedback => (
                <motion.div key={feedback.id} variants={itemVariants}>
                  <FeedbackCard feedback={feedback} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;