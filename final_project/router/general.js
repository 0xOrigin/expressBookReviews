const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(!(username && password))
    return res.status(400).json({ message: "Username and password are required!" });

  if(!isValid(username))
    return res.status(400).json({ message: "User already exists!" });

  users.push({username, password});
  return res.status(200).send("Registration Successful, Please login");
});


function getBookList() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

function getBookDetails(isbn) {
  return new Promise((resolve, reject) => {
    let book = books[parseInt(isbn)];
    if(!book)
      reject({message: "Book not found!"});
    else
      resolve(book);
  });
}


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try{
    let bookList = await getBookList();
    return res.status(200).json(bookList);
  } catch(err){
    return res.status(500).json({message: err});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  isbn = req.params.isbn;
  let bookDetails = getBookDetails(isbn).then((bookDetails) => {
    return res.status(200).json(bookDetails);
  }).catch((err) => {
    return res.status(404).json(err);
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  author = req.params.author;

  let filteredBooks = getBookList()
  .then(rows => Object.values(rows))
  .then(books => books.filter(book => book.author === author))
  .then((filteredBooks) => {
    return res.status(200).json(filteredBooks);
  }).catch((err) => {
    return res.status(404).json(err);
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  title = req.params.title;
  
  let filteredBooks = getBookList()
  .then(rows => Object.values(rows))
  .then(books => books.filter(book => book.title === title))
  .then((filteredBooks) => {
    return res.status(200).json(filteredBooks);
  }).catch((err) => {
    return res.status(404).json(err);
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  isbn = req.params.isbn;
  
  let bookDetails = getBookDetails(isbn).then((bookDetails) => {
    return res.status(200).json(bookDetails.reviews);
  }).catch((err) => {
    return res.status(404).json(err);
  });
});

module.exports.general = public_users;
