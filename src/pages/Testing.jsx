import { useState, useEffect } from 'react';

const Testing = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publishedYear: '',
    genre: '',
  });

  const [books, setBooks] = useState([]); // State untuk menyimpan data buku
  const [loading, setLoading] = useState(true); // State untuk loading indicator

  // Fetch all books from the API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/getBuku');
        const data = await response.json();
        if (response.ok) {
          setBooks(data.books);
          setLoading(false);
        } else {
          alert(data.message || 'Failed to retrieve books.');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        alert('An error occurred while retrieving books.');
      }
    };

    fetchBooks();
console.log("ini adalah log pertama kali ditampilkan");
  }, []); // Run only once when the component mounts

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log formData before sending to the server
    console.log('Data to be sent to the server:', formData);

    try {
      const response = await fetch('http://localhost:4000/api/tambahBuku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Book added successfully!');
        setFormData({
          title: '',
          author: '',
          publishedYear: '',
          genre: '',
        });

        // Refresh the books list after adding a book
        setBooks([...books, data.book]);
      } else {
        alert(data.message || 'Failed to add book.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the book.');
    }
  };

  return (
    <div>
      <h1>Add a New Book</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Author:</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Published Year:</label>
          <input
            type="number"
            name="publishedYear"
            value={formData.publishedYear}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Genre:</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Add Book</button>
      </form>

      <h2>Book List</h2>
      {loading ? (
        <p>Loading books...</p>
      ) : books.length > 0 ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> by {book.author} ({book.publishedYear}) - {book.genre}
            </li>
          ))}
        </ul>
      ) : (
        <p>No books available.</p>
      )}
    </div>
  );
};

export default Testing;
