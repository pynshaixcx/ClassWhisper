// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeedbackService from '../../api/feedback';
import DepartmentService from '../../api/departments';
import ModerationService from '../../api/moderation';
import StatCard from '../../components/analytics/StatCard';
import Chart3D from '../../components/analytics/Chart3D';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import '../../styles/Dashboard.scss';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    pendingFeedback: 0,
    approvedFeedback: 0,
    addressedFeedback: 0,
    rejectedFeedback: 0,
    totalDepartments: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalAdmins: 0,
  });
  
  const [departmentData, setDepartmentData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls - in a real app, these would be actual API calls
        // Get general stats
        const statsData = {
          totalFeedback: 248,
          pendingFeedback: 36,
          approvedFeedback: 89,
          addressedFeedback: 103,
          rejectedFeedback: 20,
          totalDepartments: 12,
          totalUsers: 523,
          totalStudents: 450,
          totalFaculty: 68,
          totalAdmins: 5,
        };
        
        setStats(statsData);
        
        // Get department data for chart
        const deptData = [
          { label: 'Computer Science', value: 78 },
          { label: 'Mathematics', value: 45 },
          { label: 'Physics', value: 32 },
          { label: 'Chemistry', value: 28 },
          { label: 'Biology', value: 30 },
          { label: 'Economics', value: 35 },
        ];
        
        setDepartmentData(deptData);
        
        // Get status data for chart
        const statData = [
          { label: 'Pending', value: statsData.pendingFeedback },
          { label: 'Approved', value: statsData.approvedFeedback },
          { label: 'Addressed', value: statsData.addressedFeedback },
          { label: 'Rejected', value: statsData.rejectedFeedback },
        ];
        
        setStatusData(statData);
        
        // Get time data for chart
        const tData = [
          { label: 'Jan', value: 18 },
          { label: 'Feb', value: 22 },
          { label: 'Mar', value: 30 },
          { label: 'Apr', value: 25 },
          { label: 'May', value: 32 },
          { label: 'Jun', value: 28 },
          { label: 'Jul', value: 20 },
          { label: 'Aug', value: 15 },
          { label: 'Sep', value: 25 },
          { label: 'Oct', value: 32 },
          { label: 'Nov', value: 0 },
          { label: 'Dec', value: 0 },
        ];
        
        setTimeData(tData);
        
        // Get tag data for chart
        const tgData = [
          { label: 'Curriculum', value: 45 },
          { label: 'Facilities', value: 30 },
          { label: 'Teaching', value: 65 },
          { label: 'Assessment', value: 40 },
          { label: 'Resources', value: 25 },
        ];
        
        setTagData(tgData);
        
        // Get recent activity
        const activityData = [
          {
            id: 1,
            type: 'feedback',
            content: 'New feedback submitted to Computer Science department',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          },
          {
            id: 2,
            type: 'moderation',
            content: 'Feedback #F-2023-10-42 approved by Dr. Smith',
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: 3,
            type: 'response',
            content: 'Faculty response added to feedback about the Physics lab equipment',
            timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          },
          {
            id: 4,
            type: 'department',
            content: 'New department "Data Science" created',
            timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 5,
            type: 'user',
            content: 'New faculty member registered',
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
        ];
        
        setRecentActivity(activityData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Format date for recent activity
  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'feedback':
        return 'fas fa-comment-alt';
      case 'moderation':
        return 'fas fa-check-circle';
      case 'response':
        return 'fas fa-reply';
      case 'department':
        return 'fas fa-building';
      case 'user':
        return 'fas fa-user';
      default:
        return 'fas fa-info-circle';
    }
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
    return <Loading fullScreen glass text="Loading admin dashboard..." />;
  }
  
  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h2 className="dashboard-title">Admin Dashboard</h2>
          <p className="dashboard-subtitle">
            System overview and performance metrics
          </p>
          
          <div className="dashboard-actions">
            <div className="admin-quick-actions">
              <Link to="/admin/departments">
                <GlassButton variant="primary">
                  <i className="fas fa-building"></i>
                  Manage Departments
                </GlassButton>
              </Link>
              
              <Link to="/admin/users">
                <GlassButton variant="primary">
                  <i className="fas fa-users"></i>
                  Manage Users
                </GlassButton>
              </Link>
              
              <Link to="/moderation/queue">
                <GlassButton variant="primary">
                  <i className="fas fa-tasks"></i>
                  Moderation Queue
                </GlassButton>
              </Link>
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
          
          <motion.div
            className="stats-overview"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                title="Total Feedback"
                value={stats.totalFeedback}
                icon="fas fa-comment-alt"
                iconColor="primary"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatCard
                title="Pending Moderation"
                value={stats.pendingFeedback}
                icon="fas fa-clock"
                iconColor="warning"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatCard
                title="Addressed Feedback"
                value={stats.addressedFeedback}
                icon="fas fa-reply"
                iconColor="success"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatCard
                title="Departments"
                value={stats.totalDepartments}
                icon="fas fa-building"
                iconColor="info"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="fas fa-users"
                iconColor="secondary"
              />
            </motion.div>
          </motion.div>
          
          <div className="dashboard-grid">
            <div className="grid-section">
              <Chart3D
                title="Feedback by Department"
                data={departmentData}
                type="bar"
                height={300}
              />
            </div>
            
            <div className="grid-section">
              <Chart3D
                title="Feedback Status"
                data={statusData}
                type="pie"
                height={300}
              />
            </div>
            
            <div className="grid-section">
              <Chart3D
                title="Feedback Over Time"
                subtitle="Monthly submissions"
                data={timeData}
                type="bar"
                height={300}
              />
            </div>
            
            <div className="grid-section">
              <Chart3D
                title="Popular Tags"
                data={tagData}
                type="column"
                height={300}
              />
            </div>
            
            <div className="grid-section">
              <GlassCard className="system-stats">
                <h4>System Statistics</h4>
                <div className="stats-item">
                  <span className="item-label">Total Students:</span>
                  <span className="item-value">{stats.totalStudents}</span>
                </div>
                <div className="stats-item">
                  <span className="item-label">Total Faculty:</span>
                  <span className="item-value">{stats.totalFaculty}</span>
                </div>
                <div className="stats-item">
                  <span className="item-label">Total Admins:</span>
                  <span className="item-value">{stats.totalAdmins}</span>
                </div>
                <div className="stats-item">
                  <span className="item-label">Feedback Response Rate:</span>
                  <span className="item-value">72%</span>
                </div>
                <div className="stats-item">
                  <span className="item-label">Average Response Time:</span>
                  <span className="item-value">2.3 days</span>
                </div>
                <div className="stats-item">
                  <span className="item-label">Anonymous Feedback Rate:</span>
                  <span className="item-value">64%</span>
                </div>
              </GlassCard>
            </div>
            
            <div className="grid-section">
              <GlassCard className="recent-activity">
                <h4>Recent Activity</h4>
                <ul className="activity-list">
                  {recentActivity.map(activity => (
                    <li key={activity.id} className={`activity-item ${activity.type}`}>
                      <div className="activity-time">
                        {formatActivityDate(activity.timestamp)}
                      </div>
                      <div className="activity-content">
                        <i className={getActivityIcon(activity.type)}></i>
                        {activity.content}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="view-all">
                  <Link to="/admin/activity">View All Activity</Link>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;