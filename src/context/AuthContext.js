import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      console.log('User data from Firestore:', userData); // Debug log
      
      // Create a new user object with the admin status
      const userWithAdmin = {
        ...userCredential.user,
        isAdmin: userData?.isAdmin || false
      };
      
      // Update the current user state
      setCurrentUser(userWithAdmin);
      
      console.log('Updated user with admin status:', userWithAdmin); // Debug log
      
      return { ...userCredential, user: userWithAdmin };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      throw error;
    }
  }

  function logout() {
    return signOut(auth).then(() => {
      setCurrentUser(null);
    });
  }

  function updateUserProfile(displayName) {
    return updateProfile(auth.currentUser, { displayName });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          console.log('Auth state changed - User data:', userData); // Debug log
          
          // Create a new user object with the admin status
          const userWithAdmin = {
            ...user,
            isAdmin: userData?.isAdmin || false
          };
          
          console.log('Setting current user with admin status:', userWithAdmin); // Debug log
          setCurrentUser(userWithAdmin);
        } catch (error) {
          console.error('Error fetching user data:', error); // Debug log
          setCurrentUser({ ...user, isAdmin: false });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

