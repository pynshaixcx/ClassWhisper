// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThreeJSBackground from '../components/common/ThreeJSBackground';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';
import Loading from '../components/common/Loading';
import './Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formFocused, setFormFocused] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };
  
  const validateStep1 = () => {
    // Validate email and username
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.username) {
      setError('Username is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    // Validate password
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setError(null);
        setCurrentStep(2);
      }
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call register function from auth context
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { 
          message: 'Registration successful! You can now log in with your credentials.' 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Format error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        try {
          const errorData = JSON.parse(err.message);
          
          if (errorData.username) {
            errorMessage = `Username: ${errorData.username[0]}`;
          } else if (errorData.email) {
            errorMessage = `Email: ${errorData.email[0]}`;
          } else if (errorData.password) {
            errorMessage = `Password: ${errorData.password[0]}`;
          }
        } catch (e) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`register-page ${formFocused ? 'focused' : ''}`}>
      <ThreeJSBackground intensity={0.3} density={80} speed={0.05} />
      
      <div className="register-container">
        <GlassCard className="register-card" effect3D={true} hoverable={false}>
          <div className="register-header">
            <Link to="/" className="brand">
              <span className="logo">CW</span>
              <span className="brand-text">Class Whisper</span>
            </Link>
            <h2>Create Account</h2>
            <p className="subtitle">Join the academic feedback community</p>
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form className="register-form" onSubmit={handleSubmit}>
            {currentStep === 1 ? (
              // Step 1: Account Information
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-group">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="glass-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFormFocused(true)}
                      onBlur={() => setFormFocused(false)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-group">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="glass-input"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setFormFocused(true)}
                      onBlur={() => setFormFocused(false)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Account Type</label>
                  <div className="role-selection">
                    <div 
                      className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}
                      onClick={() => handleRoleChange('student')}
                    >
                      <i className="fas fa-user-graduate"></i>
                      <div className="role-info">
                        <h4>Student</h4>
                        <p>Submit feedback and track responses</p>
                      </div>
                    </div>
                    
                    <div 
                      className={`role-option ${formData.role === 'faculty' ? 'selected' : ''}`}
                      onClick={() => handleRoleChange('faculty')}
                    >
                      <i className="fas fa-chalkboard-teacher"></i>
                      <div className="role-info">
                        <h4>Faculty</h4>
                        <p>Review and respond to feedback</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <GlassButton
                  className="next-button"
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                >
                  Next Step
                  <i className="fas fa-arrow-right"></i>
                </GlassButton>
              </div>
            ) : (
              // Step 2: Password
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-group">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="glass-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFormFocused(true)}
                      onBlur={() => setFormFocused(false)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="password-requirements">
                    <p>Password must be at least 8 characters long</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-group">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="glass-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFormFocused(true)}
                      onBlur={() => setFormFocused(false)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <GlassButton
                    className="back-button"
                    type="button"
                    variant="secondary"
                    onClick={handlePrevStep}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </GlassButton>
                  
                  <GlassButton
                    className="register-button"
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus"></i>
                        Create Account
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
            )}
          </form>
          
          <div className="register-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </div>
          
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </GlassCard>
      </div>
      
      {loading && <Loading fullScreen glass text="Creating your account..." />}
    </div>
  );
};

export default Register;