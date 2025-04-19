import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
// Example for AuthContext.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

function Profile() {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        console.log('No current user found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user data for:', currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setDisplayName(userData.displayName || userData.username || currentUser.email);
          console.log('User reviews:', userData.reviews);
          setUserReviews(userData.reviews || []);
        } else {
          console.log('Creating new user document');
          // Create user document if it doesn't exist
          await updateDoc(doc(db, 'users', currentUser.uid), {
            displayName: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            createdAt: new Date(),
            reviews: []
          });
          setDisplayName(currentUser.displayName || currentUser.email);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    try {
      console.log('Updating profile for user:', currentUser.uid);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName
      });
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  const handleDeleteReview = async (review) => {
    if (!currentUser) return;
    try {
      console.log('Deleting review:', review);
      // Remove review from user's profile
      await updateDoc(doc(db, 'users', currentUser.uid), {
        reviews: arrayRemove(review)
      });

      // Remove review from book
      const bookRef = doc(db, 'books', review.bookId);
      await updateDoc(bookRef, {
        reviews: arrayRemove(review)
      });

      setUserReviews(userReviews.filter(r => r !== review));
      setSuccess('Review deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container">
        <div className="error">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <div className="profile-section card slide-up">
        <div className="card-header">
          <h2>Profile Settings</h2>
        </div>
        <div className="card-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <button onClick={handleUpdateProfile} className="scale-in">
              Update Profile
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section card slide-up">
        <div className="card-header">
          <h2>Your Reviews</h2>
        </div>
        <div className="card-body">
          {userReviews.length === 0 ? (
            <p className="scale-in">No reviews yet. <Link to="/home">Browse books</Link> to write your first review!</p>
          ) : (
            <div className="reviews-grid">
              {userReviews.map((review, idx) => (
                <div key={idx} className="review-card card scale-in">
                  <h3>
                    <Link to={`/book/${review.bookId}`}>{review.bookTitle}</Link>
                  </h3>
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'filled' : ''}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p>{review.comment}</p>
                  <time>{new Date(review.timestamp).toLocaleDateString()}</time>
                  <button
                    onClick={() => handleDeleteReview(review)}
                    className="delete-btn"
                  >
                    Delete Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
