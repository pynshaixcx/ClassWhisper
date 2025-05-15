// src/components/feedback/FeedbackCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import StatusBadge from '../common/StatusBadge';
import './FeedbackCard.scss';

const FeedbackCard = ({ feedback }) => {
  // Get truncated content
  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get time elapsed since submission
  const getTimeElapsed = (dateString) => {
    const now = new Date();
    const submissionDate = new Date(dateString);
    const diffTime = Math.abs(now - submissionDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  return (
    <GlassCard className="feedback-card" effect3D={true}>
      <div className="feedback-header">
        <div className="feedback-title-wrap">
          <h3 className="feedback-title">{feedback.title}</h3>
          <StatusBadge status={feedback.status} animated={feedback.status === 'pending'} />
        </div>
        
        <div className="feedback-meta">
          <div className="feedback-department">
            <i className="fas fa-building"></i>
            {feedback.department?.name || 'Unknown Department'}
          </div>
          
          <div className="feedback-date" title={formatDate(feedback.submission_date)}>
            <i className="fas fa-clock"></i>
            {getTimeElapsed(feedback.submission_date)}
          </div>
          
          <div className="feedback-replies">
            <i className="fas fa-reply"></i>
            {feedback.replies_count || 0} {feedback.replies_count === 1 ? 'reply' : 'replies'}
          </div>
          
          {feedback.is_anonymous && (
            <div className="feedback-anonymous">
              <i className="fas fa-user-secret"></i>
              Anonymous
            </div>
          )}
        </div>
      </div>
      
      <div className="feedback-content">
        <p>{truncateContent(feedback.content)}</p>
      </div>
      
      {feedback.tags && feedback.tags.length > 0 && (
        <div className="feedback-tags">
          {feedback.tags.map(tag => (
            <span key={tag.id} className="tag">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
      
      <div className="feedback-footer">
        <Link to={`/feedback/detail/${feedback.hash_id}`}>
          <motion.button
            className="view-details-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
            <i className="fas fa-arrow-right"></i>
          </motion.button>
        </Link>
      </div>
    </GlassCard>
  );
};

export default FeedbackCard;