import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const getFlaggedReviews = async () => {
  const reviewsQuery = query(collection(db, 'reviews'), where('flagged', '==', true));
  const reviewsSnapshot = await getDocs(reviewsQuery);
  return reviewsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getBookRequests = async () => {
  const requestsQuery = query(collection(db, 'requests'), where('status', '==', 'pending'));
  const requestsSnapshot = await getDocs(requestsQuery);
  return requestsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const approveReview = async (reviewId) => {
  await updateDoc(doc(db, 'reviews', reviewId), {
    flagged: false
  });
};

export const deleteReview = async (reviewId) => {
  await deleteDoc(doc(db, 'reviews', reviewId));
};

export const approveRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'approved'
  });
};

export const rejectRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'rejected'
  });
}; 