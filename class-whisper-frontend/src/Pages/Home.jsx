// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAnimation } from '../context/AnimationContext';
import { animate, staggeredFadeIn } from '../animations';
import AnimatedBackground from '../components/3d/AnimatedBackground';
import Logo3D from '../components/3d/Logo3D';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import '../styles/Home.scss';

const Home = () => {
  const { isAuthenticated, isStudent, isFaculty, isAdmin } = useAuth();
  const { theme, animation3DEnabled, animationIntensity } = useTheme();
  const { globalScope, shouldReduceMotion } = useAnimation();
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Refs for animations
  const homeRef = useRef(null);
  const heroContentRef = useRef(null);
  const featuresRef = useRef(null);
  const timelineRef = useRef(null);
  const featureCardsRef = useRef(null);
  
  // Set up animations
  useEffect(() => {
    if (!homeRef.current || shouldReduceMotion) return;
    
    // Animate hero content
    if (heroContentRef.current) {
      staggeredFadeIn(heroContentRef.current.querySelectorAll('.animate-item'), {
        duration: 800,
        delay: 300
      });
    }
    
    // Set up the feature cards animation
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);
  
  // Animate feature card when active feature changes
  useEffect(() => {
    if (!featureCardsRef.current || shouldReduceMotion) return;
    
    const cards = featureCardsRef.current.querySelectorAll('.feature-card');
    const activeCard = cards[activeFeature];
    
    if (activeCard) {
      animate(activeCard, {
        translateY: [0, -10, 0],
        boxShadow: [
          'var(--shadow-md)',
          'var(--shadow-lg)',
          'var(--shadow-md)'
        ],
        duration: 2000,
        easing: 'easeInOutSine'
      });
    }
  }, [activeFeature, shouldReduceMotion]);
  
  // Get CTA link and text based on user role
  const getCtaLink = () => {
    if (!isAuthenticated) return '/register';
    if (isStudent) return '/feedback/dashboard';
    if (isFaculty) return '/faculty/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };
  
  const getCtaText = () => {
    if (!isAuthenticated) return 'Create Account';
    if (isStudent) return 'View Your Feedback';
    if (isFaculty || isAdmin) return 'Go to Dashboard';
    return 'Get Started';
  };
  
  // Timeline steps data
  const timelineSteps = [
    {
      title: 'Submit Feedback',
      description: 'Students submit feedback to a specific department, with the option to remain anonymous. Tags can be added to categorize the feedback.'
    },
    {
      title: 'Moderation',
      description: 'Feedback is reviewed by department faculty to ensure it meets community guidelines and contains constructive content.'
    },
    {
      title: 'Faculty Response',
      description: 'Faculty members respond to the feedback, addressing concerns and providing insights while preserving student anonymity.'
    },
    {
      title: 'Implementation',
      description: 'Feedback is analyzed and used to make improvements to courses, teaching methods, and department policies.'
    }
  ];
  
  // Feature cards data
  const features = [
    {
      icon: 'user-secret',
      title: 'Anonymous Feedback',
      description: 'Students can submit feedback anonymously, allowing for honest and constructive communication without fear of repercussions.'
    },
    {
      icon: 'building',
      title: 'Department Channels',
      description: 'Organize feedback by academic departments, ensuring it reaches the right faculty members and administrators.'
    },
    {
      icon: 'tag',
      title: 'Tagging System',
      description: 'Categorize feedback with customizable tags, making it easy to identify patterns and prioritize concerns.'
    },
    {
      icon: 'shield-alt',
      title: 'Moderation System',
      description: 'Review and manage feedback submissions with robust moderation tools to ensure constructive communication.'
    },
    {
      icon: 'chart-line',
      title: 'Analytics Dashboard',
      description: 'Track feedback statistics and trends with comprehensive analytics to identify areas for improvement.'
    },
    {
      icon: 'reply',
      title: 'Faculty Responses',
      description: 'Faculty can respond to feedback while maintaining student anonymity, fostering constructive dialogue.'
    }
  ];
  
  return (
    <div ref={homeRef} className="home-page">
      {/* 3D Animated Background */}
      {animation3DEnabled && (
        <AnimatedBackground 
          intensity={animationIntensity} 
          density={150} 
          speed={0.08} 
          interactive={true}
        />
      )}
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div ref={heroContentRef} className="hero-content">
            <h1 className="hero-title animate-item">
              Class <span>Whisper</span>
            </h1>
            
            <p className="hero-subtitle animate-item">
              Anonymous academic feedback platform
            </p>
            
            <div className="hero-description animate-item">
              <p>
                Empower students to provide honest feedback while maintaining anonymity.
                Create a transparent and constructive academic environment.
              </p>
            </div>
            
            <div className="cta-buttons animate-item">
              <Link to={getCtaLink()}>
                <Button 
                  variant="primary" 
                  size="lg"
                  rightIcon={<i className="fas fa-arrow-right"></i>}
                >
                  {getCtaText()}
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <Link to="/login">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    leftIcon={<i className="fas fa-sign-in-alt"></i>}
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="logo-3d-container">
            <Logo3D 
              text="CW" 
              size={2} 
              interactive={true} 
              animated={true}
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          
          <div ref={featureCardsRef} className="features-grid">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                effect3D={animation3DEnabled}
                glass={true}
                hoverable={true}
              >
                <div className="feature-icon">
                  <i className={`fas fa-${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section ref={timelineRef} className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="timeline">
            {timelineSteps.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <Card 
                  className="timeline-content"
                  effect3D={animation3DEnabled}
                  glass={true}
                  hoverable={true}
                >
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <Card 
            className="cta-card"
            effect3D={animation3DEnabled}
            glass={true}
            hoverable={false}
          >
            <h2>Ready to get started?</h2>
            <p>
              Join Class Whisper today and help build a better academic environment
              through constructive feedback and transparent communication.
            </p>
            <Link to={getCtaLink()}>
              <Button 
                variant="primary" 
                size="lg"
                rightIcon={<i className="fas fa-arrow-right"></i>}
              >
                {getCtaText()}
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;