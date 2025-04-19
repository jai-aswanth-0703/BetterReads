import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import books from '../data/books';

function GenrePage() {
  const { genre } = useParams();
  const [genreBooks, setGenreBooks] = useState([]);

  useEffect(() => {
    const filteredBooks = books.filter(book => 
      book.genericCategory.toLowerCase() === genre.toLowerCase()
    );
    setGenreBooks(filteredBooks);
  }, [genre]);

  return (
    <div className="container fade-in">
      <h1 className="slide-up">{genre} Books</h1>
      <div className="grid">
        {genreBooks.length > 0 ? (
          genreBooks.map(book => (
            <BookCard key={book.isbn10} book={book} />
          ))
        ) : (
          <p className="scale-in">No books found in this category.</p>
        )}
      </div>
    </div>
  );
}

export default GenrePage; 