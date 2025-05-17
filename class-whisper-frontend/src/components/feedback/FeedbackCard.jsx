// src/components/feedback/FeedbackCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, createTiltEffect } from '../../animations';
import { useTheme } from '../../context/ThemeContext';
import Card from '../common/Card';
import Button from '../common/Button';
import './FeedbackCard.scss';

/**
 * Animated feedback card component for displaying feedback submissions
 * 
 * @param {Object} props
 * @param {Object} props.feedback - Feedback data object
 * @param {string} props.feedback.id - Feedback ID
 * @param {string} props.feedback.hashId - Public hash ID for feedback
 * @param {string} props.feedback.title - Feedback title
 * @param {string} props.feedback.content - Feedback content
 * @param {string} props.feedback.department - Department name
 * @param {Array} props.feedback.tags - Array of tags
 * @param {string} props.feedback.status - Feedback status (pending, approved, addressed, rejected)
 * @param {string} props.feedback.createdAt - Creation date
 * @param {boolean} props.feedback.isAnonymous - Whether feedback is anonymous
 * @param {Object} props.feedback.response - Faculty response object (optional)
 * @param {Function} props.onDelete - Delete handler (optional)
 * @param {Function} props.onShare - Share handler (optional)
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.expanded - Whether card is initially expanded
 * @param {boolean} props.preview - Whether to show a preview version (smaller)
 */
const FeedbackCard = ({
  feedback,
  onDelete,
  onShare,
  className = '',
  expanded = false,
  preview = false,
  ...rest
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isCopied, setIsCopied] = useState(false);
  
  // Theme context
  const { theme, animation3DEnabled } = useTheme();
  
  // Refs
  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const responseRef = useRef(null);
  const tiltEffectRef = useRef(null);
  
  // Destructure feedback data
  const {
    id,
    hashId,
    title,
    content,
    department,
    tags = [],
    status = 'pending',
    createdAt,
    isAnonymous,
    response
  } = feedback || {};
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Set up 3D tilt effect
  useEffect(() => {
    if (!cardRef.current || !animation3DEnabled) return;
    
    tiltEffectRef.current = createTiltEffect(cardRef.current);
    tiltEffectRef.current.enable();
    
    return () => {
      if (tiltEffectRef.current) {
        tiltEffectRef.current.disable();
      }
    };
  }, [animation3DEnabled]);
  
  // Handle content expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Animate content height
    if (contentRef.current) {
      if (!isExpanded) {
        // Expanding
        const height = contentRef.current.scrollHeight;
        animate(contentRef.current, {
          height: [0, height],
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutCubic',
          complete: () => {
            contentRef.current.style.height = 'auto';
          }
        });
      } else {
        // Collapsing
        animate(contentRef.current, {
          height: [contentRef.current.offsetHeight, 0],
          opacity: [1, 0],
          duration: 300,
          easing: 'easeInCubic'
        });
      }
    }
    
    // Animate response height if it exists
    if (responseRef.current && response) {
      if (!isExpanded) {
        // Expanding
        const height = responseRef.current.scrollHeight;
        animate(responseRef.current, {
          height: [0, height],
          opacity: [0, 1],
          duration: 400,
          delay: 150,
          easing: 'easeOutCubic',
          complete: () => {
            responseRef.current.style.height = 'auto';
          }
        });
      } else {
        // Collapsing
        animate(responseRef.current, {
          height: [responseRef.current.offsetHeight, 0],
          opacity: [1, 0],
          duration: 300,
          easing: 'easeInCubic'
        });
      }
    }
  };
  
  // Handle share link copy
  const handleCopyLink = (e) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/feedback/detail/${hashId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
    
    if (onShare) {
      onShare(hashId);
    }
  };
  
  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(id);
    }
  };
  
  // Get status text and color
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { text: 'Pending Review', color: 'var(--color-warning)' };
      case 'approved':
        return { text: 'Approved', color: 'var(--color-info)' };
      case 'addressed':
        return { text: 'Addressed', color: 'var(--color-success)' };
      case 'rejected':
        return { text: 'Rejected', color: 'var(--color-danger)' };
      default:
        return { text: 'Pending Review', color: 'var(--color-warning)' };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Truncate content for preview mode
  const truncatedContent = preview && content?.length > 150 
    ? `${content.substring(0, 150)}...` 
    : content;
  
  // Build class names
  const cardClassName = `
    feedback-card 
    status-${status} 
    ${isExpanded ? 'expanded' : ''}
    ${preview ? 'preview' : ''}
    ${className}
  `;
  
  return (
    <Card
      ref={cardRef}
      className={cardClassName}
      hoverable={!preview}
      effect3D={animation3DEnabled && !preview}
      onClick={preview ? undefined : toggleExpand}
      {...rest}
    >
      <div className="feedback-card-header">
        <div className="feedback-card-meta">
          <div className="feedback-department">{department}</div>
          <div className="feedback-date">{formattedDate}</div>
        </div>
        
        <h3 className="feedback-title">{title}</h3>
        
        <div className="feedback-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
          >
            <span className="status-dot" style={{ backgroundColor: statusInfo.color }}></span>
            {statusInfo.text}
          </span>
          
          {isAnonymous && (
            <span className="anonymous-badge">
              <i className="fas fa-user-secret"></i> Anonymous
            </span>
          )}
        </div>
        
        {tags.length > 0 && (
          <div className="feedback-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div 
        ref={contentRef}
        className="feedback-content"
        style={{ height: isExpanded || preview ? 'auto' : '0', opacity: isExpanded || preview ? 1 : 0 }}
      >
        <p>{truncatedContent}</p>
      </div>
      
      {response && (
        <div 
          ref={responseRef}
          className="feedback-response"
          style={{ height: isExpanded ? 'auto' : '0', opacity: isExpanded ? 1 : 0 }}
        >
          <div className="response-header">
            <h4>
              <i className="fas fa-reply"></i> Faculty Response
            </h4>
            <span className="response-date">
              {new Date(response.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <p>{response.content}</p>
          <div className="response-meta">
            <span className="response-author">
              {response.authorName} - {response.authorRole}
            </span>
          </div>
        </div>
      )}
      
      <div className="feedback-card-footer">
        {preview ? (
          <Link to={`/feedback/detail/${hashId}`} className="view-details-link">
            View Details <i className="fas fa-arrow-right"></i>
          </Link>
        ) : (
          <div className="feedback-actions">
            <Button 
              variant="secondary"
              size="sm"
              leftIcon={<i className={isCopied ? "fas fa-check" : "fas fa-share-alt"}></i>}
              onClick={handleCopyLink}
            >
              {isCopied ? "Copied!" : "Share"}
            </Button>
            
            <Link to={`/feedback/detail/${hashId}`}>
              <Button 
                variant="primary"
                size="sm"
                leftIcon={<i className="fas fa-eye"></i>}
              >
                View
              </Button>
            </Link>
            
            {onDelete && (
              <Button 
                variant="danger"
                size="sm"
                leftIcon={<i className="fas fa-trash-alt"></i>}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default FeedbackCard;