// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThreeJSBackground from '../components/common/ThreeJSBackground';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';
import '../styles/Home.scss';

const Home = () => {
  const { isAuthenticated, isStudent, isFaculty, isAdmin } = useAuth();
  const [animatedSection, setAnimatedSection] = useState(0);
  
  // Cycle through sections for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedSection(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
  
  // Get CTA link based on user role
  const getCtaLink = () => {
    if (!isAuthenticated) return '/register';
    if (isStudent) return '/feedback/dashboard';
    if (isFaculty) return '/faculty/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };
  
  // Get CTA text based on user role
  const getCtaText = () => {
    if (!isAuthenticated) return 'Create Account';
    if (isStudent) return 'View Your Feedback';
    if (isFaculty || isAdmin) return 'Go to Dashboard';
    return 'Get Started';
  };
  
  return (
    <div className="home-page">
      <ThreeJSBackground intensity={0.4} density={150} speed={0.08} />
      
      <div className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="hero-title">
              Class <span>Whisper</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="hero-subtitle">
              Anonymous academic feedback platform
            </motion.p>
            
            <motion.div variants={itemVariants} className="hero-description">
              <p>
                Empower students to provide honest feedback while maintaining anonymity.
                Create a transparent and constructive academic environment.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="cta-buttons">
              <Link to={getCtaLink()}>
                <GlassButton variant="primary" size="lg">
                  {getCtaText()}
                </GlassButton>
              </Link>
              
              {!isAuthenticated && (
                <Link to="/login">
                  <GlassButton variant="secondary" size="lg">
                    Sign In
                  </GlassButton>
                </Link>
              )}
            </motion.div>
          </motion.div>
          
          <div className="logo-3d-container" id="logo-3d-container">
            {/* 3D logo will be rendered here by the 3d-logo.js script */}
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          
          <div className="features-grid">
            <GlassCard 
              className={`feature-card ${animatedSection === 0 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-user-secret"></i>
              </div>
              <h3>Anonymous Feedback</h3>
              <p>
                Students can submit feedback anonymously, allowing for honest and
                constructive communication without fear of repercussions.
              </p>
            </GlassCard>
            
            <GlassCard 
              className={`feature-card ${animatedSection === 1 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Department Channels</h3>
              <p>
                Organize feedback by academic departments, ensuring it reaches
                the right faculty members and administrators.
              </p>
            </GlassCard>
            
            <GlassCard 
              className={`feature-card ${animatedSection === 2 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-tag"></i>
              </div>
              <h3>Tagging System</h3>
              <p>
                Categorize feedback with customizable tags, making it easy to
                identify patterns and prioritize concerns.
              </p>
            </GlassCard>
            
            <GlassCard 
              className={`feature-card ${animatedSection === 0 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Moderation System</h3>
              <p>
                Review and manage feedback submissions with robust moderation
                tools to ensure constructive communication.
              </p>
            </GlassCard>
            
            <GlassCard 
              className={`feature-card ${animatedSection === 1 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>
                Track feedback statistics and trends with comprehensive analytics
                to identify areas for improvement.
              </p>
            </GlassCard>
            
            <GlassCard 
              className={`feature-card ${animatedSection === 2 ? 'active' : ''}`}
              effect3D={true}
            >
              <div className="feature-icon">
                <i className="fas fa-reply"></i>
              </div>
              <h3>Faculty Responses</h3>
              <p>
                Faculty can respond to feedback while maintaining student
                anonymity, fostering constructive dialogue.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
      
      <div className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Step 1: Submit Feedback</h3>
                <p>
                  Students submit feedback to a specific department, with the option
                  to remain anonymous. Tags can be added to categorize the feedback.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Step 2: Moderation</h3>
                <p>
                  Feedback is reviewed by department faculty to ensure it meets
                  community guidelines and contains constructive content.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Step 3: Faculty Response</h3>
                <p>
                  Faculty members respond to the feedback, addressing concerns
                  and providing insights while preserving student anonymity.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Step 4: Implementation</h3>
                <p>
                  Feedback is analyzed and used to make improvements to courses,
                  teaching methods, and department policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <div className="container">
          <GlassCard className="cta-card" effect3D={false} hoverable={false}>
            <h2>Ready to get started?</h2>
            <p>
              Join Class Whisper today and help build a better academic environment
              through constructive feedback and transparent communication.
            </p>
            <Link to={getCtaLink()}>
              <GlassButton variant="primary" size="lg">
                {getCtaText()}
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Home;