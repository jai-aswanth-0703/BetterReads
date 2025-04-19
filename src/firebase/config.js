// Updated Firebase config using v9+ modular syntax
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAu2GHyuE-8yIcMao4Db7meMjFebkTEnhE",
  authDomain: "btrr-a27aa.firebaseapp.com",
  projectId: "btrr-a27aa",
  storageBucket: "btrr-a27aa.firebasestorage.app",
  messagingSenderId: "370269852066",
  appId: "1:370269852066:web:9816410da6cfa4650a62fb",
  measurementId: "G-VNNBV82WJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Initialize Firestore with enhanced settings
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Enable persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence');
    }
  });

export { db };
