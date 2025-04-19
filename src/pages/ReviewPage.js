import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import '../styles/ReviewPage.css';

function ReviewPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookDoc = await getDoc(doc(db, 'books', bookId));
        if (bookDoc.exists()) {
          setBook({ id: bookDoc.id, ...bookDoc.data() });
        } else {
          setError('Book not found');
        }
      } catch (err) {
        setError('Error fetching book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      const review = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        rating,
        text: reviewText,
        timestamp: new Date()
      };

      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        reviews: arrayUnion(review)
      });

      // Update average rating
      const bookDoc = await getDoc(bookRef);
      const bookData = bookDoc.data();
      const reviews = bookData.reviews || [];
      const newAverageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

      await updateDoc(bookRef, {
        averageRating: newAverageRating
      });

      setSuccess('Review submitted successfully!');
      setRating(0);
      setReviewText('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error submitting review');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!book) {
    return <div className="error">Book not found</div>;
  }

  return (
    <div className="review-page">
      <div className="book-info">
        <h1>{book.title}</h1>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Average Rating:</strong> {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings yet'}</p>
      </div>

      <div className="review-form">
        <h2>Write a Review</h2>
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmitReview}>
          <div className="rating-input">
            <label>Rating:</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="review">Your Review:</label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book..."
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </form>
      </div>

      <div className="reviews-list">
        <h2>Reviews</h2>
        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="review-header">
                <span className="user-name">{review.userName}</span>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'filled' : ''}>★</span>
                  ))}
                </div>
              </div>
              <p className="review-text">{review.text}</p>
              <span className="review-date">
                {new Date(review.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}

export default ReviewPage; 