import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FirebaseError } from 'firebase/app';
// Example for AuthContext.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.isAdmin ? '/admin/dashboard' : '/home');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Verify admin code if signing up as admin
      if (isAdmin) {
        if (adminCode !== 'ADMIN123') {
          throw new Error('Invalid admin code');
        }
      }

      const { user } = await signup(email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        isAdmin,
        createdAt: new Date(),
        displayName: username,
        reviews: []
      });

      // Navigation will be handled by useEffect
    } catch (err) {
      console.error('Error during signup:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(
          <div>
            This email is already registered. Please{' '}
            <Link to="/login" style={{ color: 'var(--secondary-color)' }}>
              login
            </Link>{' '}
            instead.
          </div>
        );
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long');
      } else if (err.message === 'Invalid admin code') {
        setError('Invalid admin code. Please check and try again. The code should be: ADMIN123');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={e => setIsAdmin(e.target.checked)}
              disabled={loading}
            />
            Sign up as admin
          </label>
        </div>
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="adminCode">Admin Code (ADMIN123)</label>
            <input
              id="adminCode"
              type="password"
              placeholder="Enter admin code: ADMIN123"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
              required={isAdmin}
              disabled={loading}
            />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
