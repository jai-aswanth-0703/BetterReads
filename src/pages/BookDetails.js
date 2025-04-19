import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import books from '../data/books';

function BookDetails() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const foundBook = books.find(b => b.isbn10 === bookId);
    setBook(foundBook);
  }, [bookId]);

  if (!book) {
    return <div className="container">Book not found.</div>;
  }

  return (
    <div className="book-details">
      <div className="book-header">
        <img src={book.thumbnail} alt={book.title} />
        <div className="book-meta">
          <h1>{book.title}</h1>
          {book.subtitle && <h2>{book.subtitle}</h2>}
          <p>Author(s): {book.authors}</p>
          <p>Published: {book.publishedYear}</p>
          <p>Category: {book.genericCategory}</p>
          <p>ISBN-10: {book.isbn10}</p>
        </div>
      </div>
      <div className="book-description">
        <h3>Description</h3>
        <p>{book.description}</p>
      </div>
      <div className="reviews-section">
        <ReviewForm bookId={book.isbn10} />
      </div>
    </div>
  );
}

export default BookDetails;
