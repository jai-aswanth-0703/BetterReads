const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

let books;
try {
  // Handle ES module default export
  books = require('../data/books').default || require('../data/books');
  console.log('Books imported:', books.length, 'items');
} catch (error) {
  console.error('Error importing books:', error);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: "AIzaSyAu2GHyuE-8yIcMao4Db7meMjFebkTEnhE",
  authDomain: "btrr-a27aa.firebaseapp.com",
  projectId: "btrr-a27aa",
  storageBucket: "btrr-a27aa.firebasestorage.app",
  messagingSenderId: "370269852066",
  appId: "1:370269852066:web:9816410da6cfa4650a62fb",
  measurementId: "G-VNNBV82WJS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeBooks() {
  if (!Array.isArray(books)) {
    console.error('Error: books is not an array:', books);
    process.exit(1);
  }

  console.log(`Attempting to initialize ${books.length} books...`);
  for (const book of books) {
    try {
      const bookRef = doc(db, 'books', book.isbn10);
      await setDoc(bookRef, {
        title: book.title || '',
        authors: book.authors ? (Array.isArray(book.authors) ? book.authors : book.authors.split(';')) : [],
        isbn10: book.isbn10 || '',
        isbn13: book.isbn13 || '',
        categories: book.categories || [],
        thumbnail: book.thumbnail || '',
        description: book.description || '',
        published_year: book.publishedYear || 0,
        num_pages: book.num_pages || 0,
        genericCategory: book.genericCategory || '',
        subtitle: book.subtitle || '',
        reviews: book.reviews || [],
        averageRating: 0
      });
      console.log(`Successfully initialized book: ${book.title} (${book.isbn10})`);
    } catch (error) {
      console.error(`Error initializing book ${book.title || 'unknown'} (${book.isbn10 || 'unknown'}):`, error);
    }
  }
  console.log('Book initialization complete.');
}

initializeBooks().then(() => process.exit(0)).catch(error => {
  console.error('Initialization failed:', error);
  process.exit(1);
});