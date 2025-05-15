// src/pages/admin/DepartmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DepartmentService from '../../api/departments';
import GlassButton from '../../components/common/GlassButton';
import GlassCard from '../../components/common/GlassCard';
import Loading from '../../components/common/Loading';
import './DepartmentManagement.scss';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    admin: ''
  });
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load departments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get departments
        const departmentsResponse = await DepartmentService.getAllDepartments();
        setDepartments(departmentsResponse);
        
        // Get faculty users for admin selection
        // This would be a call to get all faculty users in a real app
        const facultyData = [
          { id: 1, name: 'Dr. Sarah Johnson' },
          { id: 2, name: 'Prof. Michael Chen' },
          { id: 3, name: 'Dr. Emily Rodriguez' },
          { id: 4, name: 'Prof. David Kim' },
          { id: 5, name: 'Dr. Rachel Lee' },
        ];
        
        setFacultyOptions(facultyData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Set up form for creating a new department
  const handleCreate = () => {
    setFormMode('create');
    setSelectedDepartment(null);
    setFormData({
      name: '',
      description: '',
      admin: ''
    });
    setFormError(null);
  };
  
  // Set up form for editing a department
  const handleEdit = (department) => {
    setFormMode('edit');
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      admin: department.admin?.id || ''
    });
    setFormError(null);
  };
  
  // Show delete confirmation dialog
  const handleDeleteClick = (department) => {
    setSelectedDepartment(department);
    setShowDeleteConfirm(true);
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedDepartment(null);
  };
  
  // Actually delete the department
  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;
    
    try {
      setSubmitting(true);
      await DepartmentService.deleteDepartment(selectedDepartment.id);
      
      // Remove from state
      setDepartments(prev => 
        prev.filter(dept => dept.id !== selectedDepartment.id)
      );
      
      // Close dialog
      setShowDeleteConfirm(false);
      setSelectedDepartment(null);
      setFormError(null);
    } catch (err) {
      console.error('Error deleting department:', err);
      setFormError('Failed to delete department. It may have associated feedback or users.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Submit the form to create/update a department
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setFormError('Department name is required.');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      if (formMode === 'create') {
        // Create new department
        const newDepartment = await DepartmentService.createDepartment(formData);
        
        // Add to state
        setDepartments(prev => [...prev, newDepartment]);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          admin: ''
        });
      } else {
        // Update existing department
        const updatedDepartment = await DepartmentService.updateDepartment(selectedDepartment.id, formData);
        
        // Update in state
        setDepartments(prev => 
          prev.map(dept => 
            dept.id === updatedDepartment.id ? updatedDepartment : dept
          )
        );
        
        // Reset selection
        setSelectedDepartment(null);
        setFormMode('create');
        setFormData({
          name: '',
          description: '',
          admin: ''
        });
      }
    } catch (err) {
      console.error('Error saving department:', err);
      setFormError('Failed to save department. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter departments based on search query
  const filteredDepartments = searchQuery
    ? departments.filter(dept => 
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : departments;
  
  // Sort departments by name
  const sortedDepartments = [...filteredDepartments].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
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
    return <Loading fullScreen glass text="Loading departments..." />;
  }
  
  return (
    <div className="department-management">
      <div className="page-header">
        <div className="container">
          <h2 className="page-title">Department Management</h2>
          <p className="page-subtitle">
            Create and manage academic departments
          </p>
          
          <div className="header-actions">
            <Link to="/admin/dashboard">
              <GlassButton variant="secondary">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </GlassButton>
            </Link>
            
            <div className="search-container">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
                <span className="search-icon">
                  <i className="fas fa-search"></i>
                </span>
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
          
          <div className="department-grid">
            <div className="department-list-section">
              <div className="section-header">
                <h3>Departments</h3>
                <GlassButton 
                  variant="primary" 
                  size="sm"
                  onClick={handleCreate}
                >
                  <i className="fas fa-plus"></i>
                  New Department
                </GlassButton>
              </div>
              
              {sortedDepartments.length === 0 ? (
                <GlassCard className="empty-state">
                  <div className="empty-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <h4>No Departments Found</h4>
                  <p>
                    {searchQuery
                      ? `No departments match your search "${searchQuery}"`
                      : 'Create your first department to get started'}
                  </p>
                  {searchQuery ? (
                    <GlassButton 
                      variant="secondary"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </GlassButton>
                  ) : (
                    <GlassButton 
                      variant="primary"
                      onClick={handleCreate}
                    >
                      <i className="fas fa-plus"></i>
                      Create Department
                    </GlassButton>
                  )}
                </GlassCard>
              ) : (
                <motion.div
                  className="department-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {sortedDepartments.map(department => (
                    <motion.div key={department.id} variants={itemVariants}>
                      <GlassCard 
                        className={`department-item ${selectedDepartment?.id === department.id ? 'selected' : ''}`}
                        onClick={() => handleEdit(department)}
                      >
                        <div className="department-info">
                          <h4 className="department-name">{department.name}</h4>
                          {department.description && (
                            <p className="department-description">
                              {department.description}
                            </p>
                          )}
                          <div className="department-meta">
                            <div className="department-admin">
                              <i className="fas fa-user-tie"></i>
                              {department.admin 
                                ? department.admin_name
                                : 'No admin assigned'}
                            </div>
                            <div className="department-stats">
                              <div className="stat-item">
                                <i className="fas fa-users"></i>
                                {department.member_count || 0} Members
                              </div>
                              <div className="stat-item">
                                <i className="fas fa-comment-alt"></i>
                                {department.feedback_count || 0} Feedback
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="department-actions">
                          <button 
                            className="action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(department);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(department);
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
            </div>
            
            <div className="department-form-section">
              <GlassCard className="department-form-card">
                <h3>{formMode === 'create' ? 'Create Department' : 'Edit Department'}</h3>
                
                {formError && (
                  <div className="form-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="department-form">
                  <div className="form-group">
                    <label htmlFor="name">Department Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter department name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter department description"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="admin">Department Admin (Optional)</label>
                    <select
                      id="admin"
                      name="admin"
                      value={formData.admin}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">-- Select Admin --</option>
                      {facultyOptions.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Only faculty members can be department admins
                    </div>
                  </div>
                  
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
                          <i className={`fas fa-${formMode === 'create' ? 'plus' : 'save'}`}></i>
                          {formMode === 'create' ? 'Create Department' : 'Update Department'}
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
      {showDeleteConfirm && selectedDepartment && (
        <div className="modal-overlay">
          <GlassCard className="confirmation-dialog">
            <div className="dialog-header">
              <h3>Delete Department</h3>
              <button className="close-button" onClick={handleCancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>
                Are you sure you want to delete the department "{selectedDepartment.name}"?
              </p>
              <p className="warning-text">
                This action cannot be undone. All associated feedback and tags will also be deleted.
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
                    Delete Department
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

export default DepartmentManagement;