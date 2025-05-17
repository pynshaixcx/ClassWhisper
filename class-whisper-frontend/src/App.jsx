// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import AnimationProvider from './context/AnimationContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageContainer from './components/layout/PageContainer';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import ModerationQueue from './pages/faculty/ModerationQueue';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import UserManagement from './pages/admin/UserManagement';

// Public Pages
import Home from './pages/Home';
import FeedbackForm from './pages/feedback/FeedbackForm';
import FeedbackDetail from './pages/feedback/FeedbackDetail';

// Import global styles
import './styles/global.scss';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" />;
  }
  
  return element;
};

function App() {
  // Handle theme based on system preference
  useEffect(() => {
    // Apply high contrast if needed
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    
    // Apply reduced motion if needed
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-animations');
    }
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AnimationProvider>
          <AuthProvider>
            <div className="app">
              <Navbar />
              <PageContainer>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Feedback Routes */}
                  <Route path="/feedback/create" element={
                    <ProtectedRoute element={<FeedbackForm />} />
                  } />
                  <Route path="/feedback/create/:departmentId" element={
                    <ProtectedRoute element={<FeedbackForm />} />
                  } />
                  <Route path="/feedback/detail/:hashId" element={
                    <ProtectedRoute element={<FeedbackDetail />} />
                  } />
                  <Route path="/feedback/success/:hashId" element={
                    <ProtectedRoute element={<FeedbackDetail />} />
                  } />
                  
                  {/* Student Routes */}
                  <Route path="/feedback/dashboard" element={
                    <ProtectedRoute element={<StudentDashboard />} requiredRole="student" />
                  } />
                  
                  {/* Faculty Routes */}
                  <Route path="/faculty/dashboard" element={
                    <ProtectedRoute element={<FacultyDashboard />} requiredRole="faculty" />
                  } />
                  <Route path="/moderation/queue" element={
                    <ProtectedRoute element={<ModerationQueue />} requiredRole="faculty" />
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
                  } />
                  <Route path="/admin/departments" element={
                    <ProtectedRoute element={<DepartmentManagement />} requiredRole="admin" />
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute element={<UserManagement />} requiredRole="admin" />
                  } />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PageContainer>
              <Footer />
            </div>
          </AuthProvider>
        </AnimationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;