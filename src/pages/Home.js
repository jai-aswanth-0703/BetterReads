import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import books from '../data/books';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);

  useEffect(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genericCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchTerm]);

  return (
    <div className="home-page">
      <h1>Discover and review your favorite books!</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard key={book.isbn10} book={book} />
          ))
        ) : (
          <p className="text-center">No books found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
