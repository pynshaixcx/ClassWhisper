// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DepartmentService from '../../api/departments';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import './UserManagement.scss';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
    department: '',
    is_active: true
  });
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Load users and departments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get departments for filter and form
        const departmentsResponse = await DepartmentService.getAllDepartments();
        setDepartments(departmentsResponse);
        
        // Get users - this would be a real API call in a complete app
        // Mock data for demonstration
        const usersData = [
          {
            id: 1,
            username: 'jsmith',
            email: 'john.smith@example.com',
            first_name: 'John',
            last_name: 'Smith',
            is_student: true,
            is_faculty: false,
            is_admin: false,
            profile: { department: { id: 1, name: 'Computer Science' } },
            is_active: true,
            date_joined: '2023-01-15T12:30:45Z',
            last_login: '2023-10-10T08:45:12Z'
          },
          {
            id: 2,
            username: 'sarahjohnson',
            email: 'sarah.johnson@example.com',
            first_name: 'Sarah',
            last_name: 'Johnson',
            is_student: false,
            is_faculty: true,
            is_admin: false,
            profile: { department: { id: 2, name: 'Mathematics' } },
            is_active: true,
            date_joined: '2023-02-05T10:20:35Z',
            last_login: '2023-10-12T14:30:22Z'
          },
          {
            id: 3,
            username: 'davidkim',
            email: 'david.kim@example.com',
            first_name: 'David',
            last_name: 'Kim',
            is_student: false,
            is_faculty: true,
            is_admin: true,
            profile: { department: { id: 1, name: 'Computer Science' } },
            is_active: true,
            date_joined: '2023-01-02T09:15:30Z',
            last_login: '2023-10-14T11:20:05Z'
          },
          {
            id: 4,
            username: 'emilywong',
            email: 'emily.wong@example.com',
            first_name: 'Emily',
            last_name: 'Wong',
            is_student: true,
            is_faculty: false,
            is_admin: false,
            profile: { department: { id: 3, name: 'Physics' } },
            is_active: true,
            date_joined: '2023-03-12T15:40:25Z',
            last_login: '2023-10-09T09:05:18Z'
          },
          {
            id: 5,
            username: 'michaelrodriguez',
            email: 'michael.rodriguez@example.com',
            first_name: 'Michael',
            last_name: 'Rodriguez',
            is_student: false,
            is_faculty: true,
            is_admin: false,
            profile: { department: { id: 4, name: 'Chemistry' } },
            is_active: false,
            date_joined: '2023-02-18T11:25:40Z',
            last_login: '2023-09-25T16:35:10Z'
          }
        ];
        
        setUsers(usersData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Set up form for creating a new user
  const handleCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'student',
      department: '',
      is_active: true
    });
    setFormError(null);
  };
  
  // Set up form for editing a user
  const handleEdit = (user) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.is_admin ? 'admin' : user.is_faculty ? 'faculty' : 'student',
      department: user.profile?.department?.id || '',
      is_active: user.is_active
    });
    setFormError(null);
  };
  
  // Show delete confirmation dialog
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };
  
  // Actually delete the user
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      // This would be a real API call in a complete app
      // await UserService.deleteUser(selectedUser.id);
      
      // For mock data, just remove from state
      setUsers(prev => 
        prev.filter(user => user.id !== selectedUser.id)
      );
      
      // Close dialog
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      setFormError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setFormError('Failed to delete user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Submit the form to create/update a user
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username.trim() || !formData.email.trim()) {
      setFormError('Username and email are required.');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      // Prepare user data from form
      const userData = {
        ...formData,
        is_student: formData.role === 'student',
        is_faculty: formData.role === 'faculty',
        is_admin: formData.role === 'admin',
        profile: {
          department: formData.department ? { id: parseInt(formData.department) } : null
        }
      };
      
      if (formMode === 'create') {
        // This would be a real API call in a complete app
        // const newUser = await UserService.createUser(userData);
        
        // For mock data, create a new user with a generated ID
        const newUser = {
          id: Math.max(...users.map(u => u.id)) + 1,
          ...userData,
          date_joined: new Date().toISOString(),
          last_login: null
        };
        
        // Add department name for display
        if (newUser.profile.department) {
          const dept = departments.find(d => d.id === parseInt(formData.department));
          if (dept) {
            newUser.profile.department.name = dept.name;
          }
        }
        
        // Add to state
        setUsers(prev => [...prev, newUser]);
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          role: 'student',
          department: '',
          is_active: true
        });
      } else {
        // This would be a real API call in a complete app
        // const updatedUser = await UserService.updateUser(selectedUser.id, userData);
        
        // For mock data, update the user in state
        const updatedUser = {
          ...selectedUser,
          ...userData,
          profile: {
            ...selectedUser.profile,
            department: formData.department 
              ? { 
                  id: parseInt(formData.department),
                  name: departments.find(d => d.id === parseInt(formData.department))?.name
                }
              : null
          }
        };
        
        // Update in state
        setUsers(prev => 
          prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        
        // Reset selection
        setSelectedUser(null);
        setFormMode('create');
        setFormData({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          role: 'student',
          department: '',
          is_active: true
        });
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setFormError('Failed to save user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle role filter change
  const handleRoleFilter = (e) => {
    setFilterRole(e.target.value);
  };
  
  // Handle department filter change
  const handleDepartmentFilter = (e) => {
    setFilterDepartment(e.target.value);
  };
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const searchTerms = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      user.username.toLowerCase().includes(searchTerms) || 
      user.email.toLowerCase().includes(searchTerms) || 
      (user.first_name && user.first_name.toLowerCase().includes(searchTerms)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerms));
    
    // Role filter
    let matchesRole = true;
    if (filterRole === 'student') matchesRole = user.is_student;
    else if (filterRole === 'faculty') matchesRole = user.is_faculty;
    else if (filterRole === 'admin') matchesRole = user.is_admin;
    
    // Department filter
    const matchesDepartment = !filterDepartment || 
      (user.profile?.department?.id === parseInt(filterDepartment));
    
    return matchesSearch && matchesRole && matchesDepartment;
  });
  
  // Sort users by name
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.username;
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.username;
    return nameA.localeCompare(nameB);
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get user display name
  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };
  
  // Get user role display
  const getUserRole = (user) => {
    if (user.is_admin) return 'Admin';
    if (user.is_faculty) return 'Faculty';
    if (user.is_student) return 'Student';
    return 'User';
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
    return <Loading fullScreen glass text="Loading users..." />;
  }
  
  return (
    <div className="user-management">
      <div className="page-header">
        <div className="container">
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">
            Create and manage user accounts
          </p>
          
          <div className="header-actions">
            <Link to="/admin/dashboard">
              <GlassButton variant="secondary">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </GlassButton>
            </Link>
            
            <div className="filter-controls">
              <div className="search-container">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                  />
                  <span className="search-icon">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
              
              <div className="filter-selects">
                <select
                  value={filterRole}
                  onChange={handleRoleFilter}
                  className="filter-select"
                  aria-label="Filter by role"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admins</option>
                </select>
                
                <select
                  value={filterDepartment}
                  onChange={handleDepartmentFilter}
                  className="filter-select"
                  aria-label="Filter by department"
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
      </div>
      
      <div className="page-content">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          <div className="user-grid">
            <div className="user-list-section">
              <div className="section-header">
                <h3>Users</h3>
                <GlassButton 
                  variant="primary" 
                  size="sm"
                  onClick={handleCreate}
                >
                  <i className="fas fa-plus"></i>
                  New User
                </GlassButton>
              </div>
              
              {sortedUsers.length === 0 ? (
                <GlassCard className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <h4>No Users Found</h4>
                  <p>
                    {searchQuery || filterRole || filterDepartment
                      ? 'No users match your search criteria'
                      : 'Create your first user to get started'}
                  </p>
                  {(searchQuery || filterRole || filterDepartment) ? (
                    <GlassButton 
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterRole('');
                        setFilterDepartment('');
                      }}
                    >
                      Clear Filters
                    </GlassButton>
                  ) : (
                    <GlassButton 
                      variant="primary"
                      onClick={handleCreate}
                    >
                      <i className="fas fa-plus"></i>
                      Create User
                    </GlassButton>
                  )}
                </GlassCard>
              ) : (
                <motion.div
                  className="user-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {sortedUsers.map(user => (
                    <motion.div key={user.id} variants={itemVariants}>
                      <GlassCard 
                        className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${!user.is_active ? 'inactive' : ''}`}
                        onClick={() => handleEdit(user)}
                      >
                        <div className="user-avatar">
                          {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="user-info">
                          <h4 className="user-name">{getUserDisplayName(user)}</h4>
                          <div className="user-meta">
                            <div className="user-username">
                              <i className="fas fa-at"></i>
                              {user.username}
                            </div>
                            <div className="user-email">
                              <i className="fas fa-envelope"></i>
                              {user.email}
                            </div>
                          </div>
                          <div className="user-details">
                            <div className="user-role">
                              <i className={`fas fa-${user.is_admin ? 'user-shield' : user.is_faculty ? 'chalkboard-teacher' : 'user-graduate'}`}></i>
                              {getUserRole(user)}
                            </div>
                            <div className="user-department">
                              <i className="fas fa-building"></i>
                              {user.profile?.department?.name || 'No Department'}
                            </div>
                            <div className="user-date">
                              <i className="fas fa-calendar-alt"></i>
                              Joined {formatDate(user.date_joined)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="user-actions">
                          {!user.is_active && (
                            <span className="inactive-badge">Inactive</span>
                          )}
                          <button 
                            className="action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user);
                            }}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {filteredUsers.length > 0 && (
                <div className="user-count">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              )}
            </div>
            
            <div className="user-form-section">
              <GlassCard className="user-form-card">
                <h3>{formMode === 'create' ? 'Create User' : 'Edit User'}</h3>
                
                {formError && (
                  <div className="form-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="user-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="department">Department</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">-- No Department --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="is_active">
                        Active Account
                      </label>
                    </div>
                    <div className="form-text">
                      Inactive accounts cannot login or submit feedback
                    </div>
                  </div>
                  
                  {formMode === 'create' && (
                    <div className="password-note">
                      <i className="fas fa-info-circle"></i>
                      A random password will be generated and sent to the user's email
                    </div>
                  )}
                  
                  <div className="form-actions">
                    {formMode === 'edit' && (
                      <GlassButton
                        type="button"
                        variant="secondary"
                        onClick={handleCreate}
                      >
                        Cancel
                      </GlassButton>
                    )}
                    
                    <GlassButton
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin"></i>
                          {formMode === 'create' ? 'Creating...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas fa-${formMode === 'create' ? 'user-plus' : 'save'}`}></i>
                          {formMode === 'create' ? 'Create User' : 'Update User'}
                        </>
                      )}
                    </GlassButton>
                  </div>
                </form>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedUser && (
        <div className="modal-overlay">
          <GlassCard className="confirmation-dialog">
            <div className="dialog-header">
              <h3>Delete User</h3>
              <button className="close-button" onClick={handleCancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>
                Are you sure you want to delete the user "{getUserDisplayName(selectedUser)}"?
              </p>
              <p className="warning-text">
                This action cannot be undone. All associated feedback will be anonymized.
              </p>
            </div>
            
            <div className="dialog-actions">
              <GlassButton
                variant="secondary"
                onClick={handleCancelDelete}
                disabled={submitting}
              >
                Cancel
              </GlassButton>
              
              <GlassButton
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    Delete User
                  </>
                )}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default UserManagement;