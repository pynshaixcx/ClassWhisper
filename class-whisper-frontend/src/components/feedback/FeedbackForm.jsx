// src/components/feedback/FeedbackForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DepartmentService from '../../api/departments';
import FeedbackService from '../../api/feedback';
import TagService from '../../api/tags';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import Loading from '../common/Loading';
import '../styles/FeedbackForm.scss';

const FeedbackForm = ({ departmentId = null }) => {
  const navigate = useNavigate();
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    department: departmentId || '',
    tags: [],
    is_anonymous: false
  });
  
  // Options data
  const [departments, setDepartments] = useState([]);
  const [tags, setTags] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formFocused, setFormFocused] = useState(false);
  
  // Initialize form data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments
        const departmentsData = await DepartmentService.getAllDepartments();
        setDepartments(departmentsData);
        
        // If department is provided, fetch its tags
        if (departmentId) {
          const tagsData = await TagService.getDepartmentTags(departmentId);
          setTags(tagsData);
          
          // Set department in form data
          setFormData(prev => ({
            ...prev,
            department: departmentId
          }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load initial form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [departmentId]);
  
  // Fetch tags when department changes
  useEffect(() => {
    const fetchTags = async () => {
      if (!formData.department) {
        setTags([]);
        return;
      }
      
      try {
        const tagsData = await TagService.getDepartmentTags(formData.department);
        setTags(tagsData);
      } catch (err) {
        console.error('Error fetching department tags:', err);
      }
    };
    
    fetchTags();
  }, [formData.department]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'tags') {
      // Handle multi-select for tags
      const tagIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData(prev => ({
        ...prev,
        tags: tagIds
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Validate step and move to next
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.title.trim()) {
        setError('Please enter a title for your feedback.');
        return;
      }
      
      if (!formData.department) {
        setError('Please select a department.');
        return;
      }
      
      setCurrentStep(2);
      setError(null);
    } else if (currentStep === 2) {
      // Validate step 2
      if (!formData.content.trim()) {
        setError('Please enter your feedback content.');
        return;
      }
      
      setCurrentStep(3);
      setError(null);
    }
  };
  
  // Go back to previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setError(null);
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare data for submission
      const submitData = {
        title: formData.title,
        content: formData.content,
        department_id: formData.department,
        tag_ids: formData.tags,
        is_anonymous: formData.is_anonymous
      };
      
      // Submit feedback
      const response = await FeedbackService.submitFeedback(submitData);
      
      // Navigate to success page
      navigate(`/feedback/success/${response.hash_id}`);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Animation variants
  const formVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };
  
  if (loading) {
    return <Loading glass text="Loading form..." />;
  }
  
  return (
    <div className={`feedback-form-container ${formFocused ? 'focused' : ''}`}>
      <GlassCard className="feedback-form-card" effect3D={false} hoverable={false}>
        <div className="form-header">
          <h2>Submit Feedback</h2>
          <div className="form-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Basic Info</div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Content</div>
            </div>
            
            <div className="step-connector"></div>
            
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Review</div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="form-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="form-group">
                  <label htmlFor="title">Feedback Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="Enter a descriptive title"
                    value={formData.title}
                    onChange={handleChange}
                    onFocus={() => setFormFocused(true)}
                    onBlur={() => setFormFocused(false)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setFormFocused(true)}
                    onBlur={() => setFormFocused(false)}
                    required
                    disabled={!!departmentId}
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                  >
                    Next
                    <i className="fas fa-arrow-right"></i>
                  </GlassButton>
                </div>
              </motion.div>
            )}
            
            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="form-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="form-group">
                  <label htmlFor="content">Feedback Content</label>
                  <textarea
                    id="content"
                    name="content"
                    className="form-control"
                    placeholder="Describe your feedback in detail..."
                    rows="6"
                    value={formData.content}
                    onChange={handleChange}
                    onFocus={() => setFormFocused(true)}
                    onBlur={() => setFormFocused(false)}
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tags">Tags (Optional)</label>
                  <select
                    id="tags"
                    name="tags"
                    className="form-select"
                    multiple
                    value={formData.tags}
                    onChange={handleChange}
                    onFocus={() => setFormFocused(true)}
                    onBlur={() => setFormFocused(false)}
                  >
                    {tags.map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Hold Ctrl (or Cmd) to select multiple tags
                  </div>
                </div>
                
                <div className="form-actions">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={handlePrevStep}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </GlassButton>
                  
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                  >
                    Next
                    <i className="fas fa-arrow-right"></i>
                  </GlassButton>
                </div>
              </motion.div>
            )}
            
            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="form-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="is_anonymous"
                      name="is_anonymous"
                      className="form-check-input"
                      checked={formData.is_anonymous}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_anonymous">
                      Submit Anonymously
                    </label>
                  </div>
                  <div className="form-text">
                    If checked, your name will not be shown with this feedback.
                  </div>
                </div>
                
                <div className="feedback-preview">
                  <h4>Review Your Feedback</h4>
                  
                  <div className="preview-item">
                    <div className="preview-label">Title:</div>
                    <div className="preview-value">{formData.title}</div>
                  </div>
                  
                  <div className="preview-item">
                    <div className="preview-label">Department:</div>
                    <div className="preview-value">
                      {departments.find(d => d.id.toString() === formData.department.toString())?.name || 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="preview-item">
                    <div className="preview-label">Content:</div>
                    <div className="preview-value content">{formData.content}</div>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="preview-item">
                      <div className="preview-label">Tags:</div>
                      <div className="preview-value tags">
                        {formData.tags.map(tagId => (
                          <span key={tagId} className="tag">
                            #{tags.find(t => t.id === tagId)?.name || 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="preview-item">
                    <div className="preview-label">Anonymous:</div>
                    <div className="preview-value">
                      {formData.is_anonymous ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={handlePrevStep}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </GlassButton>
                  
                  <GlassButton
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Submit Feedback
                      </>
                    )}
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </GlassCard>
    </div>
  );
};

export default FeedbackForm;