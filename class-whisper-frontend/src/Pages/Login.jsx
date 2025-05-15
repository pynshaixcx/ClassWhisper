// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThreeJSBackground from '../components/common/ThreeJSBackground';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';
import Loading from '../components/common/Loading';
import './Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formFocused, setFormFocused] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect URL from query parameters or previous state
  const from = location.state?.from?.pathname || '/';
  
  // If user is already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await login(email, password, rememberMe);
      
      // Auth context will update isAuthenticated and trigger the redirect
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`login-page ${formFocused ? 'focused' : ''}`}>
      <ThreeJSBackground intensity={0.3} density={80} speed={0.05} />
      
      <div className="login-container">
        <GlassCard className="login-card" effect3D={true} hoverable={false}>
          <div className="login-header">
            <Link to="/" className="brand">
              <span className="logo">CW</span>
              <span className="brand-text">Class Whisper</span>
            </Link>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue</p>
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  className="glass-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFormFocused(true)}
                  onBlur={() => setFormFocused(false)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  className="glass-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFormFocused(true)}
                  onBlur={() => setFormFocused(false)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              
              <Link to="/accounts/password-reset" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            
            <GlassButton
              className="login-button"
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </GlassButton>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account?</p>
            <Link to="/register" className="register-link">
              Create Account
            </Link>
          </div>
        </GlassCard>
      </div>
      
      {loading && <Loading fullScreen glass text="Signing in..." />}
    </div>
  );
};

export default Login;