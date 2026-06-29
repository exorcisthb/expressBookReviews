const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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

// Task 2: Get all books using async/await
public_users.get('/', async function (req, res) {
  try {
    const bookList = await new Promise((resolve) => resolve(books));
    res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (err) {
    res.status(500).json({message: "Error retrieving books"});
  }
});

// Task 3: Get book details by ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  })
  .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
  .catch(err => res.status(404).json({message: err}));
});

// Task 4: Get books by author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const matchedBooks = await new Promise((resolve, reject) => {
      let result = {};
      Object.keys(books).forEach(key => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          result[key] = books[key];
        }
      });
      if (Object.keys(result).length > 0) resolve(result);
      else reject("No books found by this author");
    });
    res.status(200).send(JSON.stringify(matchedBooks, null, 4));
  } catch (err) {
    res.status(404).json({message: err});
  }
});

// Task 5: Get books by title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const matchedBooks = await new Promise((resolve, reject) => {
      let result = {};
      Object.keys(books).forEach(key => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          result[key] = books[key];
        }
      });
      if (Object.keys(result).length > 0) resolve(result);
      else reject("No books found with this title");
    });
    res.status(200).send(JSON.stringify(matchedBooks, null, 4));
  } catch (err) {
    res.status(404).json({message: err});
  }
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
// Axios helper functions (for Task 11 - external use)
// Pattern: async/await + Promise callbacks with Axios
// =====================================================

const getAllBooks = async () => {
  const response = await axios.get('http://localhost:5000/');
  return response.data;
};

const getBookByISBN = (isbn) => {
  return axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => { throw new Error(`Error fetching book by ISBN ${isbn}`); });
};

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
