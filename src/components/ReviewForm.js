import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import books from '../data/books';

function ReviewForm({ bookId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentUser } = useAuth();

  // Monitor online/offline status with server ping
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        await getDoc(doc(db, 'books', bookId));
        setIsOnline(true);
      } catch (err) {
        console.error('Connectivity check failed:', err);
        setIsOnline(false);
      }
    };

    checkConnectivity();

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [bookId]);

  useEffect(() => {
    const fetchReviews = async () => {
      console.log('Fetching reviews for bookId:', bookId, 'isOnline:', isOnline);
      if (!isOnline) {
        setError('You are currently offline. Please check your internet connection.');
        return;
      }

      try {
        console.log('Attempting to fetch book document from Firestore');
        const bookRef = doc(db, 'books', bookId);
        const bookDoc = await getDoc(bookRef);
        console.log('Book document fetched:', bookDoc.exists(), bookDoc.data());

        if (bookDoc.exists()) {
          const bookData = bookDoc.data();
          setReviews(bookData.reviews || []);
        } else {
          const foundBook = books.find(b => b.isbn10 === bookId);
          console.log('Book not found in Firestore, found in books.js:', !!foundBook);
          if (foundBook) {
            await updateDoc(bookRef, {
              title: foundBook.title,
              authors: foundBook.authors,
              reviews: [],
              averageRating: 0
            });
            setReviews([]);
          } else {
            setError('Book not found');
          }
        }
        setError('');
      } catch (err) {
        console.error('Error fetching reviews:', err, 'code:', err.code, 'message:', err.message);
        if (err.code === 'unavailable') {
          setError('Unable to connect to the server. Please check your internet connection or try again later.');
          setTimeout(() => fetchReviews(), 5000);
        } else if (err.code === 'failed-precondition') {
          setError('Please refresh the page to enable offline support');
        } else {
          setError('Failed to load reviews. Please try refreshing the page.');
        }
      }
    };

    fetchReviews();
  }, [bookId, isOnline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called', { bookId, rating, comment: comment.trim(), isOnline, currentUser });

    if (!isOnline) {
      console.log('Submission failed: Offline');
      setError('You are currently offline. Please check your internet connection.');
      return;
    }

    if (!currentUser) {
      console.log('Submission failed: No currentUser');
      setError('Please login to submit a review');
      return;
    }

    if (!comment.trim()) {
      console.log('Submission failed: Empty comment');
      setError('Please write a review');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Attempting to submit review for bookId:', bookId);

      const bookRef = doc(db, 'books', bookId);
      const bookDoc = await getDoc(bookRef);
      console.log('Book document before update:', bookDoc.exists(), bookDoc.data());

      if (!bookDoc.exists()) {
        const foundBook = books.find(b => b.isbn10 === bookId);
        console.log('Book not found in Firestore, found in books.js:', !!foundBook);
        if (!foundBook) {
          throw new Error('Book not found in the database');
        }
        await updateDoc(bookRef, {
          title: foundBook.title,
          authors: foundBook.authors,
          reviews: [],
          averageRating: 0
        });
        console.log('Initialized book document in Firestore');
      }

      const bookData = bookDoc.exists() ? bookDoc.data() : { title: books.find(b => b.isbn10 === bookId)?.title };
      const bookTitle = bookData.title;
      console.log('Book title for review:', bookTitle);

      const newReview = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        rating: Number(rating),
        comment: comment.trim(),
        timestamp: new Date(), // Changed from serverTimestamp() to new Date()
        bookId,
        bookTitle,
        flagged: false
      };
      console.log('New review object:', newReview);

      console.log('Updating book document with new review');
      await updateDoc(bookRef, {
        reviews: arrayUnion(newReview)
      });
      console.log('Book document updated with review');

      console.log('Updating user document with new review');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        reviews: arrayUnion(newReview)
      });
      console.log('User document updated with review');

      console.log('Fetching updated book document for average rating');
      const updatedBookDoc = await getDoc(bookRef);
      const updatedBookData = updatedBookDoc.data();
      const reviews = updatedBookData.reviews || [];
      const newAverageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;
      console.log('Calculated new average rating:', newAverageRating);

      console.log('Updating book document with new average rating');
      await updateDoc(bookRef, {
        averageRating: newAverageRating
      });
      console.log('Book document updated with new average rating');

      setReviews(prevReviews => [...prevReviews, newReview]);
      setComment('');
      setRating(5);
      setSuccess('Review submitted successfully!');
      console.log('Review submission successful');
    } catch (err) {
      console.error('Error submitting review:', err, 'code:', err.code, 'message:', err.message);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
      console.log('Submission attempt complete, loading:', false);
    }
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      {!isOnline && (
        <div className="error-message">
          You are currently offline. Please check your internet connection.
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`star ${value <= rating ? 'filled' : ''}`}
                onClick={() => setRating(value)}
                disabled={loading || !isOnline}
              >
                {value <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        <div className="comment-input">
          <label>Review:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
            required
            disabled={loading || !isOnline}
          />
        </div>
        <button type="submit" disabled={loading || !isOnline}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      <div className="reviews-list">
        <h3>Reviews ({reviews.length})</h3>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review">
              <div className="review-header">
                <span className="user">{review.userName}</span>
                <div className="rating">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
              <p className="comment">{review.comment}</p>
              <time>{new Date(review.timestamp).toLocaleDateString()}</time>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}

export default ReviewForm;