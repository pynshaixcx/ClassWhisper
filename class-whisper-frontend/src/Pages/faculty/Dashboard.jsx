// src/pages/faculty/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import FeedbackService from '../../api/feedback';
import DepartmentService from '../../api/departments';
import FeedbackCard from '../../components/feedback/FeedbackCard';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import '../../styles/Dashboard.scss';

const FacultyDashboard = () => {
  const { user } = useAuth();
  
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    addressed: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get faculty dashboard data
        const params = {};
        if (selectedStatus) params.status = selectedStatus;
        if (searchQuery) params.q = searchQuery;
        
        // If user has a department, include it in the params
        const departmentId = user?.profile?.department?.id;
        if (departmentId) {
          params.department = departmentId;
        }
        
        const feedbackResponse = await FeedbackService.getFacultyFeedback(params);
        setFeedbackItems(feedbackResponse);
        
        // Calculate stats
        const totalFeedback = feedbackResponse.length;
        const pendingFeedback = feedbackResponse.filter(f => f.status === 'pending').length;
        const approvedFeedback = feedbackResponse.filter(f => f.status === 'approved').length;
        const addressedFeedback = feedbackResponse.filter(f => f.status === 'addressed').length;
        const rejectedFeedback = feedbackResponse.filter(f => f.status === 'rejected').length;
        
        setStats({
          total: totalFeedback,
          pending: pendingFeedback,
          approved: approvedFeedback,
          addressed: addressedFeedback,
          rejected: rejectedFeedback
        });
        
        // Get department info if user has a department
        if (departmentId) {
          const departmentResponse = await DepartmentService.getDepartment(departmentId);
          setDepartmentInfo(departmentResponse);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, selectedStatus, searchQuery]);
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The effect will handle fetching data with the updated search query
  };
  
  // Calculate percentage for a status
  const calculatePercentage = (count) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
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
    return <Loading fullScreen glass text="Loading faculty dashboard..." />;
  }
  
  return (
    <div className="dashboard faculty-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h2 className="dashboard-title">Faculty Dashboard</h2>
          <p className="dashboard-subtitle">
            {departmentInfo ? (
              <>Manage feedback for {departmentInfo.name} department</>
            ) : (
              <>Manage and respond to student feedback</>
            )}
          </p>
          
          <div className="dashboard-actions">
            <Link to="/moderation/queue">
              <GlassButton variant="primary">
                <i className="fas fa-tasks"></i>
                Moderation Queue
              </GlassButton>
            </Link>
            
            <div className="search-filter">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="status-select"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="addressed">Addressed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </form>
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
              <div className="stat-percentage">{calculatePercentage(stats.pending)}%</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon approved">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
              <div className="stat-percentage">{calculatePercentage(stats.approved)}%</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon addressed">
                <i className="fas fa-reply"></i>
              </div>
              <div className="stat-value">{stats.addressed}</div>
              <div className="stat-label">Addressed</div>
              <div className="stat-percentage">{calculatePercentage(stats.addressed)}%</div>
            </GlassCard>
            
            <GlassCard className="stat-card">
              <div className="stat-icon rejected">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-value">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
              <div className="stat-percentage">{calculatePercentage(stats.rejected)}%</div>
            </GlassCard>
          </div>
          
          <div className="feedback-section">
            <h3 className="section-title">
              {selectedStatus ? (
                `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Feedback`
              ) : (
                'All Feedback'
              )}
              {searchQuery && ` - Search: "${searchQuery}"`}
            </h3>
            
            {feedbackItems.length === 0 ? (
              <GlassCard className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h4>No feedback found</h4>
                <p>
                  {searchQuery
                    ? `No feedback matches your search "${searchQuery}"`
                    : selectedStatus
                      ? `No ${selectedStatus} feedback found`
                      : 'No feedback has been submitted yet'}
                </p>
                {searchQuery && (
                  <GlassButton
                    variant="secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </GlassButton>
                )}
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
    </div>
  );
};

export default FacultyDashboard;