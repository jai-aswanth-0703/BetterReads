import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Lazy load components
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./components/Auth/Login'));
const Signup = lazy(() => import('./components/Auth/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const GenrePage = lazy(() => import('./pages/GenrePage'));
const AdminLogin = lazy(() => import('./components/Auth/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));

// Loading component
const LoadingFallback = () => (
  <div className="container">
    <div className="loading">
      <div className="loading-spinner"></div>
      <span className="loading-text">Loading...</span>
    </div>
  </div>
);

// Protect routes that require authentication
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Protect admin routes
function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Public route - redirects to home/profile if user is authenticated
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (currentUser) {
    return <Navigate to={currentUser.isAdmin ? "/admin/dashboard" : "/home"} />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                } />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } />
                <Route path="/admin/login" element={
                  <PublicRoute>
                    <AdminLogin />
                  </PublicRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/home" element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/book/:bookId" element={
                  <PrivateRoute>
                    <BookDetails />
                  </PrivateRoute>
                } />
                <Route path="/book/:bookId/review" element={
                  <PrivateRoute>
                    <ReviewPage />
                  </PrivateRoute>
                } />
                <Route path="/genre/:genre" element={
                  <PrivateRoute>
                    <GenrePage />
                  </PrivateRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
