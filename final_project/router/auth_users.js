const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userMatches = users.filter((user) => user.username === username);
  return userMatches.length === 0;
}

const isAuthenticatedUser = (username, password) => {
  let matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length === 1;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;
  
    if(!(username && password))
        return res.status(400).json({message: "Username and password are required!"});
  
    if(!isAuthenticatedUser(username, password)) 
      return res.status(400).json({message: "Invalid Credentials. Please check username or password!"});
    
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
  
    req.session.authorization = {accessToken, username}
    return res.status(200).send("Login Successful");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization.username;
  let review = req.body.review;

  if(!review)
    return res.status(400).json({ message: "Review is required" });

  let book = books[isbn];
  if(!book)
    return res.status(404).json({ message: `ISBN ${isbn} not found` });

  book.reviews[username] = review;
  return res.status(200).send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization.username;
  let book = books[isbn];

  if(!book)
    return res.status(404).json({ message: `ISBN ${isbn} not found` });

  delete book.reviews[username];
  return res.status(200).send("Review deleted successfully");
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
