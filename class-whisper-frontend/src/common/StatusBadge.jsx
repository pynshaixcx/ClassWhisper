// src/components/common/StatusBadge.jsx
import React from 'react';
import './StatusBadge.scss';

/**
 * A component that displays feedback status with appropriate styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value (pending, approved, rejected, addressed)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animated - Enable pulse animation
 */
const StatusBadge = ({ 
  status, 
  className = '',
  animated = false,
  ...rest
}) => {
  if (!status) return null;
  
  // Map status to appropriate class
  const statusClass = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected',
    addressed: 'status-addressed'
  }[status.toLowerCase()] || '';
  
  // Create className based on props
  const badgeClassName = `status-badge ${statusClass} ${animated ? 'animated' : ''} ${className}`;
  
  // Capitalize status for display
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={badgeClassName} {...rest}>
      {displayStatus}
    </span>
  );
};

export default StatusBadge;