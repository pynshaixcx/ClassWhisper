// src/components/feedback/FeedbackDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeedbackService from '../../api/feedback';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import './FeedbackDetail.scss';

const FeedbackDetail = () => {
  const { hashId } = useParams();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Load feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const data = await FeedbackService.getFeedbackByHash(hashId);
        setFeedback(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback. It may have been removed or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    if (hashId) {
      fetchFeedback();
    }
  }, [hashId]);
  
  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await FeedbackService.addReply(hashId, replyContent);
      
      // Update feedback with new reply
      setFeedback(prev => ({
        ...prev,
        replies: [...prev.replies, response],
        status: response.admin ? 'addressed' : prev.status
      }));
      
      // Clear reply form
      setReplyContent('');
      setError(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setSubmitting(true);
      await FeedbackService.updateStatus(hashId, newStatus);
      
      // Update feedback status
      setFeedback(prev => ({
        ...prev,
        status: newStatus
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if user can manage this feedback (faculty or admin)
  const canManageFeedback = () => {
    if (!feedback) return false;
    
    // This is a simplified check. In reality, we'd check if the user is faculty for this department
    // or is an admin, which would be part of the user object from auth context
    return true; // Simplified for now
  };
  
  if (loading) {
    return <Loading fullScreen glass text="Loading feedback..." />;
  }
  
  if (error) {
    return (
      <div className="feedback-detail-container">
        <GlassCard className="error-card">
          <div className="error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3>Error Loading Feedback</h3>
          <p>{error}</p>
          <div className="error-actions">
            <GlassButton variant="secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
              Go Back
            </GlassButton>
            <GlassButton variant="primary" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i>
              Try Again
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }
  
  if (!feedback) {
    return null;
  }
  
  return (
    <div className="feedback-detail-container">
      <div className="feedback-detail-header">
        <GlassButton variant="secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
          Back
        </GlassButton>
        
        <div className="feedback-id">
          ID: <span className="hash-id">{feedback.hash_id}</span>
        </div>
      </div>
      
      <GlassCard className="feedback-detail-card">
        <div className="feedback-detail-meta">
          <div className="meta-left">
            <div className="submission-info">
              <div className="department">
                <i className="fas fa-building"></i>
                {feedback.department?.name || 'Unknown Department'}
              </div>
              
              <div className="submission-date">
                <i className="fas fa-calendar-alt"></i>
                {formatDate(feedback.submission_date)}
              </div>
              
              {feedback.is_anonymous ? (
                <div className="anonymous">
                  <i className="fas fa-user-secret"></i>
                  Anonymous
                </div>
              ) : (
                <div className="author">
                  <i className="fas fa-user"></i>
                  {feedback.author_display}
                </div>
              )}
            </div>
          </div>
          
          <div className="meta-right">
            <StatusBadge status={feedback.status} animated={feedback.status === 'pending'} />
          </div>
        </div>
        
        <h2 className="feedback-detail-title">{feedback.title}</h2>
        
        <div className="feedback-detail-content">
          <p>{feedback.content}</p>
        </div>
        
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="feedback-detail-tags">
            {feedback.tags.map(tag => (
              <span key={tag.id} className="tag">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        
        {canManageFeedback() && (
          <div className="feedback-actions">
            <div className="action-title">Update Status</div>
            <div className="status-buttons">
              <GlassButton
                size="sm"
                variant={feedback.status === 'pending' ? 'primary' : 'secondary'}
                disabled={submitting || feedback.status === 'pending'}
                onClick={() => handleStatusUpdate('pending')}
              >
                <i className="fas fa-clock"></i>
                Pending
              </GlassButton>
              
              <GlassButton
                size="sm"
                variant={feedback.status === 'approved' ? 'primary' : 'secondary'}
                disabled={submitting || feedback.status === 'approved'}
                onClick={() => handleStatusUpdate('approved')}
              >
                <i className="fas fa-check-circle"></i>
                Approve
              </GlassButton>
              
              <GlassButton
                size="sm"
                variant={feedback.status === 'rejected' ? 'primary' : 'secondary'}
                disabled={submitting || feedback.status === 'rejected'}
                onClick={() => handleStatusUpdate('rejected')}
              >
                <i className="fas fa-times-circle"></i>
                Reject
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
      
      <div className="feedback-replies">
        <h3 className="section-title">
          <i className="fas fa-reply"></i>
          Replies ({feedback.replies?.length || 0})
        </h3>
        
        {feedback.replies && feedback.replies.length > 0 ? (
          <div className="reply-list">
            {feedback.replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                className="reply-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="reply-card">
                  <div className="reply-header">
                    <div className="reply-author">
                      <div className="author-avatar">
                        {reply.admin_display.charAt(0).toUpperCase()}
                      </div>
                      <div className="author-name">{reply.admin_display}</div>
                    </div>
                    
                    <div className="reply-date">
                      {formatDate(reply.created_at)}
                    </div>
                  </div>
                  
                  <div className="reply-content">
                    <p>{reply.content}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="no-replies">
            <div className="empty-icon">
              <i className="fas fa-comments"></i>
            </div>
            <p>No replies yet</p>
          </GlassCard>
        )}
        
        <GlassCard className="reply-form-card">
          <h4>Add Reply</h4>
          <form onSubmit={handleReplySubmit}>
            <div className="form-group">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <GlassButton
                type="submit"
                variant="primary"
                disabled={submitting || !replyContent.trim()}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Reply
                  </>
                )}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default FeedbackDetail;