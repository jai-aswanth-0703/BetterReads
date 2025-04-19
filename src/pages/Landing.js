import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to BetterReads</h1>
        <p className="subtitle">Your personal book discovery and review platform</p>
        {!currentUser && (
          <div className="cta-buttons">
            <Link to="/login" className="cta-button primary">Login</Link>
            <Link to="/signup" className="cta-button secondary">Sign Up</Link>
          </div>
        )}
      </div>
      <div className="features-section">
        <div className="feature-card">
          <h3>Discover Books</h3>
          <p>Explore our vast collection of books across various genres</p>
        </div>
        <div className="feature-card">
          <h3>Share Reviews</h3>
          <p>Share your thoughts and read reviews from other book lovers</p>
        </div>
        <div className="feature-card">
          <h3>Track Reading</h3>
          <p>Keep track of your reading history and favorite books</p>
        </div>
      </div>
    </div>
  );
}

export default Landing; 