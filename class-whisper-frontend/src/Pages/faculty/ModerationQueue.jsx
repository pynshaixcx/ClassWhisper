// src/pages/faculty/ModerationQueue.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ModerationService from '../../api/moderation';
import DepartmentService from '../../api/departments';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import './ModerationQueue.scss';

const ModerationQueue = () => {
  const { user } = useAuth();
  
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moderatingItem, setModeratingItem] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Load moderation queue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get moderation queue
        const params = {};
        if (selectedDepartment) params.department = selectedDepartment;
        if (searchQuery) params.q = searchQuery;
        
        const queueResponse = await ModerationService.getModerationQueue(params);
        setFeedbackItems(queueResponse);
        
        // Get departments for filter
        const departmentsResponse = await DepartmentService.getAllDepartments();
        setDepartments(departmentsResponse);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching moderation queue:', err);
        setError('Failed to load moderation queue. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDepartment, searchQuery]);
  
  // Handle department filter change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
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
  
  // Open moderation dialog
  const openModerationDialog = (feedback) => {
    setModeratingItem(feedback);
    setModerationReason('');
  };
  
  // Close moderation dialog
  const closeModerationDialog = () => {
    setModeratingItem(null);
    setModerationReason('');
  };
  
  // Handle feedback moderation
  const handleModeration = async (action) => {
    if (!moderatingItem) return;
    
    try {
      setSubmitting(true);
      
      await ModerationService.moderateFeedback(
        moderatingItem.id,
        action,
        moderationReason
      );
      
      // Remove moderated item from the list
      setFeedbackItems(prevItems => 
        prevItems.filter(item => item.id !== moderatingItem.id)
      );
      
      // Close the dialog
      closeModerationDialog();
      
    } catch (err) {
      console.error('Moderation error:', err);
      setError('Failed to moderate feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    return <Loading fullScreen glass text="Loading moderation queue..." />;
  }
  
  return (
    <div className="moderation-queue">
      <div className="page-header">
        <div className="container">
          <h2 className="page-title">Moderation Queue</h2>
          <p className="page-subtitle">
            Review pending feedback submissions
          </p>
          
          <div className="header-actions">
            <Link to="/faculty/dashboard">
              <GlassButton variant="secondary">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </GlassButton>
            </Link>
            
            <div className="filter-controls">
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
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  className="department-select"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="page-content">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          <div className="queue-summary">
            <GlassCard className="summary-card">
              <div className="summary-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="summary-text">
                <h3>Pending Moderation</h3>
                <div className="summary-count">{feedbackItems.length}</div>
                <p>Items in queue</p>
              </div>
            </GlassCard>
          </div>
          
          {feedbackItems.length === 0 ? (
            <GlassCard className="empty-queue">
              <div className="empty-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Queue is Empty</h3>
              <p>
                {searchQuery
                  ? `No pending feedback matches your search "${searchQuery}"`
                  : selectedDepartment
                    ? 'No pending feedback for the selected department'
                    : 'There are no pending feedback submissions to moderate'}
              </p>
              {(searchQuery || selectedDepartment) && (
                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('');
                  }}
                >
                  Clear Filters
                </GlassButton>
              )}
            </GlassCard>
          ) : (
            <motion.div
              className="queue-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {feedbackItems.map(feedback => (
                <motion.div key={feedback.id} variants={itemVariants}>
                  <GlassCard className="queue-item">
                    <div className="item-content">
                      <div className="item-header">
                        <h3 className="item-title">{feedback.title}</h3>
                        <div className="item-meta">
                          <div className="item-department">
                            <i className="fas fa-building"></i>
                            {feedback.department?.name || 'Unknown Department'}
                          </div>
                          
                          <div className="item-date">
                            <i className="fas fa-calendar-alt"></i>
                            {formatDate(feedback.submission_date)}
                          </div>
                          
                          {feedback.is_anonymous && (
                            <div className="item-anonymous">
                              <i className="fas fa-user-secret"></i>
                              Anonymous
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="item-body">
                        <p>{truncateText(feedback.content, 200)}</p>
                      </div>
                      
                      {feedback.tags && feedback.tags.length > 0 && (
                        <div className="item-tags">
                          {feedback.tags.map(tag => (
                            <span key={tag.id} className="tag">
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="item-actions">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => openModerationDialog(feedback)}
                      >
                        <i className="fas fa-check"></i>
                        Moderate
                      </GlassButton>
                      
                      <Link to={`/feedback/detail/${feedback.hash_id}`}>
                        <GlassButton variant="secondary" size="sm">
                          <i className="fas fa-eye"></i>
                          View Details
                        </GlassButton>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Moderation Dialog */}
      {moderatingItem && (
        <div className="moderation-overlay">
          <GlassCard className="moderation-dialog">
            <div className="dialog-header">
              <h3>Moderate Feedback</h3>
              <button className="close-button" onClick={closeModerationDialog}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="feedback-preview">
                <div className="preview-item">
                  <div className="preview-label">Title:</div>
                  <div className="preview-value">{moderatingItem.title}</div>
                </div>
                
                <div className="preview-item">
                  <div className="preview-label">Content:</div>
                  <div className="preview-value content">{moderatingItem.content}</div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="moderationReason">Reason (Optional):</label>
                <textarea
                  id="moderationReason"
                  className="form-control"
                  placeholder="Enter a reason for your moderation decision..."
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="dialog-actions">
              <GlassButton
                variant="danger"
                disabled={submitting}
                onClick={() => handleModeration('rejected')}
              >
                <i className="fas fa-times-circle"></i>
                Reject
              </GlassButton>
              
              <GlassButton
                variant="secondary"
                disabled={submitting}
                onClick={() => handleModeration('flagged')}
              >
                <i className="fas fa-flag"></i>
                Flag for Review
              </GlassButton>
              
              <GlassButton
                variant="success"
                disabled={submitting}
                onClick={() => handleModeration('approved')}
              >
                <i className="fas fa-check-circle"></i>
                Approve
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;