import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching admin data...');
      
      // Fetch flagged reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('flagged', '==', true),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch book requests
      const requestsQuery = query(
        collection(db, 'bookRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Fetched reviews:', reviewsData);
      console.log('Fetched requests:', requestsData);

      setReviews(reviewsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debug logs
    console.log('Current user in AdminDashboard:', currentUser);
    console.log('Is admin?', currentUser?.isAdmin);

    // Redirect if not admin
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!currentUser.isAdmin) {
      console.log('User is not admin, redirecting to home');
      navigate('/home');
      return;
    }

    fetchData();
  }, [currentUser, navigate, fetchData]);

  const handleReviewAction = async (reviewId, action) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      if (action === 'approve') {
        await updateDoc(reviewRef, {
          flagged: false,
          approved: true,
          approvedBy: currentUser.uid,
          approvedAt: new Date()
        });
      } else {
        await deleteDoc(reviewRef);
      }
      await fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error handling review:', error);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const requestRef = doc(db, 'bookRequests', requestId);
      await updateDoc(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedBy: currentUser.uid,
        processedAt: new Date()
      });
      await fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  if (!currentUser || !currentUser.isAdmin) {
    return null; // Let the useEffect handle redirection
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <span className="loading-text">Loading Admin Dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {currentUser.email}</p>
      </div>
      
      <section className="dashboard-section">
        <h2>Flagged Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <h3>{review.bookTitle}</h3>
                <p className="review-meta">By: {review.userName}</p>
                <p className="review-content">{review.content}</p>
                <div className="actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleReviewAction(review.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleReviewAction(review.id, 'delete')}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No flagged reviews</p>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Book Requests ({requests.length})</h2>
        {requests.length > 0 ? (
          <div className="requests-list">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <h3>{request.title}</h3>
                <p className="request-meta">Requested by: {request.userName}</p>
                <p>Author: {request.author}</p>
                <p>ISBN: {request.isbn}</p>
                <div className="actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleRequestAction(request.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleRequestAction(request.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No pending requests</p>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard; 