import { useState } from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="book-card">
      <img
        src={book.thumbnail}
        alt={book.title}
        className={imageLoaded ? 'loaded' : 'loading'}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />
      <div className="book-info">
        <h3>{book.title}</h3>
        {book.subtitle && <p className="subtitle">{book.subtitle}</p>}
        <p className="author">{book.authors}</p>
        <p className="published-year">Published: {book.publishedYear}</p>
        <p className="category">Category: {book.genericCategory}</p>
        <div className="book-actions">
          <Link to={`/book/${book.isbn10}`} className="view-details">
            View Details
          </Link>
          <Link to={`/book/${book.isbn10}/review`} className="write-review">
            Write a Review
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
