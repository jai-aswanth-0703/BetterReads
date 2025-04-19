import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting admin login...'); // Debug log
      const { user } = await login(email, password);
      
      console.log('Login successful, checking admin status...'); // Debug log
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      console.log('User data:', userData); // Debug log
      
      if (userData?.isAdmin) {
        console.log('Admin status confirmed, redirecting...'); // Debug log
        navigate('/admin/dashboard');
      } else {
        console.log('Not an admin, logging out...'); // Debug log
        setError('Access denied. This portal is for administrators only.');
        // Sign out the non-admin user
        await logout();
      }
    } catch (err) {
      console.error('Admin login error:', err); // Debug log
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      {error && (
        <div className="error-message">
          {error}
          {error.includes('Access denied') && (
            <p>
              <Link to="/login">Return to regular login</Link>
            </p>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Admin Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login as Admin</button>
      </form>
      <p>
        <Link to="/login">Return to regular login</Link>
      </p>
    </div>
  );
}

export default AdminLogin; 