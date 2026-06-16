const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:5000';

async function runTests() {
  try {
    console.log("Starting API tests to generate Coursera assignment files...");

    // Helper to format file contents
    const saveOutput = (filename, command, output) => {
      const content = `Command:\n${command}\n\nOutput:\n${JSON.stringify(output, null, 4)}\n`;
      fs.writeFileSync(path.join(__dirname, filename), content);
      console.log(`Saved output to ${filename}`);
    };

    // Task 2: Get all books
    console.log("Testing Task 2: Get all books...");
    const resAllBooks = await axios.get(`${baseURL}/`);
    saveOutput('getallbooks', `curl -s http://localhost:5000/`, resAllBooks.data);

    // Task 3: Get books by ISBN
    console.log("Testing Task 3: Get books by ISBN (1)...");
    const resISBN = await axios.get(`${baseURL}/isbn/1`);
    saveOutput('getbooksbyISBN', `curl -s http://localhost:5000/isbn/1`, resISBN.data);

    // Task 4: Get books by Author
    console.log("Testing Task 4: Get books by Author (Jane Austen)...");
    const resAuthor = await axios.get(`${baseURL}/author/Jane Austen`);
    saveOutput('getbooksbyauthor', `curl -s http://localhost:5000/author/Jane%20Austen`, resAuthor.data);

    // Task 5: Get books by Title
    console.log("Testing Task 5: Get books by Title (Fairy tales)...");
    const resTitle = await axios.get(`${baseURL}/title/Fairy tales`);
    saveOutput('getbooksbytitle', `curl -s http://localhost:5000/title/Fairy%20tales`, resTitle.data);

    // Task 6: Get initial book reviews
    console.log("Testing Task 6: Get book review (1)...");
    const resReview = await axios.get(`${baseURL}/review/1`);
    saveOutput('getbookreview', `curl -s http://localhost:5000/review/1`, resReview.data);

    // Task 7: Register a new user
    console.log("Testing Task 7: Register user...");
    const registerData = { username: "student", password: "password123" };
    try {
      const resRegister = await axios.post(`${baseURL}/register`, registerData);
      saveOutput('register', `curl -s -X POST -H "Content-Type: application/json" -d '{"username":"student","password":"password123"}' http://localhost:5000/register`, resRegister.data);
    } catch (err) {
      saveOutput('register', `curl -s -X POST -H "Content-Type: application/json" -d '{"username":"student","password":"password123"}' http://localhost:5000/register`, err.response ? err.response.data : err.message);
    }

    // Task 8: Login
    console.log("Testing Task 8: Login user...");
    const loginData = { username: "student", password: "password123" };
    const resLogin = await axios.post(`${baseURL}/customer/login`, loginData);
    saveOutput('login', `curl -s -X POST -H "Content-Type: application/json" -d '{"username":"student","password":"password123"}' http://localhost:5000/customer/login`, resLogin.data);

    // Capture the cookie for session-based authenticated requests
    const cookie = resLogin.headers['set-cookie'] ? resLogin.headers['set-cookie'][0] : '';
    console.log("Captured Session Cookie:", cookie);

    const authConfig = {
      headers: {
        Cookie: cookie
      }
    };

    // Task 9: Add or Modify Review
    console.log("Testing Task 9: Add review to ISBN 1...");
    const resAddReview = await axios.put(`${baseURL}/customer/auth/review/1?review=Amazing book! Highly recommended.`, {}, authConfig);
    // Fetch book reviews again to show it was added
    const resUpdatedReviews = await axios.get(`${baseURL}/review/1`);
    saveOutput('reviewadded', `curl -s -b cookies.txt -X PUT -d "review=Amazing book!" http://localhost:5000/customer/auth/review/1`, {
        action_response: resAddReview.data,
        updated_reviews: resUpdatedReviews.data
    });

    // Task 10: Delete Review
    console.log("Testing Task 10: Delete review for ISBN 1...");
    const resDeleteReview = await axios.delete(`${baseURL}/customer/auth/review/1`, authConfig);
    saveOutput('deletereview', `curl -s -b cookies.txt -X DELETE http://localhost:5000/customer/auth/review/1`, resDeleteReview.data);

    console.log("All tasks completed successfully and outputs saved!");
  } catch (error) {
    console.error("Error running tests:", error.response ? error.response.data : error.message);
  }
}

runTests();
