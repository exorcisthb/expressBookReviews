const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// User Registration
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Task 2: Get the book list available in the shop (using Promise)
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });
  getBooks.then((bookList) => {
    res.status(200).send(JSON.stringify(bookList, null, 4));
  }, (err) => {
    res.status(500).json({message: "Error retrieving books"});
  });
});

// Task 3: Get book details based on ISBN (using Promise)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    let book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
  getBook.then((book) => {
    res.status(200).send(JSON.stringify(book, null, 4));
  }).catch((err) => {
    res.status(404).json({message: err});
  });
});

// Task 4: Get book details based on author (using Promise)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    let matchedBooks = {};
    const bookKeys = Object.keys(books);
    bookKeys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchedBooks[key] = books[key];
      }
    });
    if (Object.keys(matchedBooks).length > 0) {
      resolve(matchedBooks);
    } else {
      reject("No books found by this author");
    }
  });
  getBooksByAuthor.then((matched) => {
    res.status(200).send(JSON.stringify(matched, null, 4));
  }).catch((err) => {
    res.status(404).json({message: err});
  });
});

// Task 5: Get all books based on title (using Promise)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let matchedBooks = {};
    const bookKeys = Object.keys(books);
    bookKeys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchedBooks[key] = books[key];
      }
    });
    if (Object.keys(matchedBooks).length > 0) {
      resolve(matchedBooks);
    } else {
      reject("No books found with this title");
    }
  });
  getBooksByTitle.then((matched) => {
    res.status(200).send(JSON.stringify(matched, null, 4));
  }).catch((err) => {
    res.status(404).json({message: err});
  });
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

// =====================================================
// Tasks 10-13: Async/Await and Promise Callbacks with Axios
// =====================================================

// Task 10: Get all books using async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    throw new Error("Error fetching all books: " + error.message);
  }
};

// Task 11: Get book details by ISBN using Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw new Error(`Error fetching book by ISBN ${isbn}: ` + error.message);
    });
};

// Task 12: Get books by Author using async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books by author ${author}: ` + error.message);
  }
};

// Task 13: Get books by Title using async/await with Axios
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books by title "${title}": ` + error.message);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
