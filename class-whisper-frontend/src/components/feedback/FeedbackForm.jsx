// src/components/feedback/FeedbackForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { animate, staggeredFadeIn } from '../../animations';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import './FeedbackForm.scss';

/**
 * Interactive feedback submission form component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Object} props.initialValues - Initial form values
 * @param {boolean} props.isEdit - Whether form is in edit mode
 * @param {Array} props.departments - List of available departments
 * @param {Array} props.availableTags - List of available tags
 * @param {Function} props.onCancel - Cancel handler function
 * @param {boolean} props.loading - Loading state
 */
const FeedbackForm = ({
  onSubmit,
  initialValues = {},
  isEdit = false,
  departments = [],
  availableTags = [],
  onCancel,
  loading = false
}) => {
  // Get department ID from URL if available
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  // Context hooks
  const { user } = useAuth();
  const { animation3DEnabled } = useTheme();
  
  // Default form values
  const defaultValues = {
    title: '',
    content: '',
    departmentId: departmentId || '',
    isAnonymous: false,
    tags: []
  };
  
  // Form state
  const [formValues, setFormValues] = useState({ ...defaultValues, ...initialValues });
  const [formErrors, setFormErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Refs for animations
  const formRef = useRef(null);
  const formElementsRef = useRef(null);
  const submitButtonRef = useRef(null);
  
  // Character limit
  const MAX_CHARACTERS = 2000;
  
  // Set up animations when component mounts
  useEffect(() => {
    if (!formRef.current || !formElementsRef.current) return;
    
    // Animate form elements with staggered effect
    const formElements = formElementsRef.current.querySelectorAll('.animate-item');
    staggeredFadeIn(formElements, {
      duration: 800,
      delay: 100,
      easing: 'easeOutCubic'
    });
  }, []);
  
  // Update character count when content changes
  useEffect(() => {
    setCharacterCount(formValues.content.length);
  }, [formValues.content]);
  
  // Form input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for the field being changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Add tag to the selected tags
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Format tag (lowercase, no spaces)
    const formattedTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if tag already exists
    if (formValues.tags.includes(formattedTag)) {
      setTagInput('');
      return;
    }
    
    // Add tag to the list
    setFormValues(prev => ({
      ...prev,
      tags: [...prev.tags, formattedTag]
    }));
    
    // Clear tag input
    setTagInput('');
  };
  
  // Handle enter key in tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Remove tag from the selected tags
  const handleRemoveTag = (tagToRemove) => {
    setFormValues(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add a suggested tag
  const handleAddSuggestedTag = (tag) => {
    if (formValues.tags.includes(tag)) return;
    
    setFormValues(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    
    // Animate the tag button
    const tagElement = document.querySelector(`.suggested-tag[data-tag="${tag}"]`);
    if (tagElement) {
      animate(tagElement, {
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutBack'
      });
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!formValues.title.trim()) {
      errors.title = 'Title is required';
    } else if (formValues.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!formValues.content.trim()) {
      errors.content = 'Feedback content is required';
    } else if (formValues.content.length < 20) {
      errors.content = 'Feedback content must be at least 20 characters';
    }
    
    if (!formValues.departmentId) {
      errors.departmentId = 'Please select a department';
    }
    
    return errors;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Animate error shake on submit button
      if (submitButtonRef.current) {
        animate(submitButtonRef.current, {
          translateX: [0, -10, 10, -5, 5, 0],
          duration: 500,
          easing: 'easeOutElastic(1, 0.3)'
        });
      }
      
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    
    try {
      // Call the onSubmit handler provided by parent component
      await onSubmit(formValues);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Reset form after successful submission (if not in edit mode)
      if (!isEdit) {
        setFormValues(defaultValues);
        
        // Redirect to success page or dashboard after a short delay
        setTimeout(() => {
          navigate('/feedback/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Set form-level error
      setFormErrors(prev => ({
        ...prev,
        form: 'Failed to submit feedback. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter available tags that are not already selected
  const unselectedTags = availableTags.filter(tag => !formValues.tags.includes(tag));
  
  return (
    <div className="feedback-form-container" ref={formRef}>
      <Card 
        className="feedback-form-card"
        effect3D={animation3DEnabled}
      >
        <div className="form-header">
          <h2 className="form-title animate-item">
            {isEdit ? 'Edit Feedback' : 'Submit Feedback'}
          </h2>
          <p className="form-description animate-item">
            Share your thoughts with faculty and administrators anonymously.
            Your feedback will be reviewed before being sent to the appropriate department.
          </p>
        </div>
        
        {showSuccessMessage ? (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Feedback Submitted Successfully!</h3>
            <p>Thank you for your feedback. Your submission has been received and will be reviewed soon.</p>
            <Button 
              variant="primary"
              onClick={() => navigate('/feedback/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} ref={formElementsRef}>
            <div className="form-section animate-item">
              <Input
                label="Title"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                placeholder="Provide a brief title for your feedback"
                error={formErrors.title}
                required
                autoFocus
              />
            </div>
            
            <div className="form-section animate-item">
              <label className="textarea-label">
                Feedback Content
                <span className="required-mark">*</span>
                <span className="character-count" style={{ color: characterCount > MAX_CHARACTERS ? 'var(--color-danger)' : undefined }}>
                  {characterCount}/{MAX_CHARACTERS}
                </span>
              </label>
              <textarea
                name="content"
                value={formValues.content}
                onChange={handleChange}
                placeholder="Describe your feedback in detail. Be specific and constructive."
                rows={6}
                className={formErrors.content ? 'has-error' : ''}
                maxLength={MAX_CHARACTERS}
                required
              ></textarea>
              {formErrors.content && (
                <div className="error-message">{formErrors.content}</div>
              )}
            </div>
            
            <div className="form-section animate-item">
              <label className="select-label">
                Department
                <span className="required-mark">*</span>
              </label>
              <select
                name="departmentId"
                value={formValues.departmentId}
                onChange={handleChange}
                className={formErrors.departmentId ? 'has-error' : ''}
                required
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {formErrors.departmentId && (
                <div className="error-message">{formErrors.departmentId}</div>
              )}
            </div>
            
            <div className="form-section tags-section animate-item">
              <label className="tags-label">
                Tags <span className="optional">(optional)</span>
              </label>
              <p className="tags-hint">Add tags to categorize your feedback</p>
              
              <div className="tag-input-container">
                <Input
                  name="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                  icon={<i className="fas fa-tag"></i>}
                  endIcon={<i className="fas fa-plus"></i>}
                  onEndIconClick={handleAddTag}
                />
              </div>
              
              {formValues.tags.length > 0 && (
                <div className="selected-tags">
                  {formValues.tags.map(tag => (
                    <span key={tag} className="selected-tag">
                      {tag}
                      <button 
                        type="button" 
                        className="remove-tag"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {unselectedTags.length > 0 && (
                <div className="suggested-tags">
                  <label className="suggested-tags-label">Suggested Tags:</label>
                  <div className="tag-buttons">
                    {unselectedTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className="suggested-tag"
                        data-tag={tag}
                        onClick={() => handleAddSuggestedTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-section anonymous-section animate-item">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formValues.isAnonymous}
                  onChange={handleChange}
                />
                <label htmlFor="isAnonymous" className="checkbox-label">
                  Submit anonymously
                </label>
              </div>
              <p className="anonymous-hint">
                If checked, your name will not be visible to the department or faculty members.
                Note that administrators may still have access to submission metadata for moderation purposes.
              </p>
            </div>
            
            {formErrors.form && (
              <div className="form-error animate-item">
                {formErrors.form}
              </div>
            )}
            
            <div className="form-actions animate-item">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              
              <Button
                ref={submitButtonRef}
                type="submit"
                variant="primary"
                isLoading={isSubmitting || loading}
                disabled={isSubmitting || loading || characterCount > MAX_CHARACTERS}
                rightIcon={<i className="fas fa-paper-plane"></i>}
              >
                {isEdit ? 'Update Feedback' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default FeedbackForm;