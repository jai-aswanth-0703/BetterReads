import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Example for AuthContext.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link 
        to={currentUser ? (currentUser.isAdmin ? "/admin/dashboard" : "/home") : "/"} 
        className="logo"
      >
        BetterReads
      </Link>
      <div className="nav-links">
        {currentUser ? (
          <>
            {currentUser.isAdmin ? (
              // Admin navigation links
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/home">Browse Books</Link>
              </>
            ) : (
              // Regular user navigation links
              <>
                <Link to="/home">Home</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/admin/login">Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
