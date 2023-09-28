const express = require('express');
const app = express();
const path = require('path');
const request = require('request');
const axios = require('axios');
const cors = require('cors');
const ejs = require('ejs'); 
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');
app.set('views', 'Authentication');
app.use(express.urlencoded({ extended: true }));
app.use('/static',express.static(path.join(__dirname,'Authentication')))
//firebase
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');

var serviceAccount = require("./Authentication/key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
app.get('/home', (req, res) => {
 res.render('home1')
});
app.get('/page',(req,res)=>{
  res.render('page.ejs');
})
app.get('/signup', (req, res) => {
    res.render("signup");
  })
  app.get("/login",(req,res)=>{
    res.render('login');
  })
  app.get('/dash',(req,res)=>{
    res.render('dash');
  })
  app.post('/loginsuc', async (req, res) => {
    const email = req.body.email;
    const password = req.body.pswd;
  
    // Query the database to find a user with the provided email
    const userQuery = await db.collection('logindetails').where('Email', '==', email).get();
  
    if (userQuery.size === 0) {
      // No user found with the provided email
      return res.render('failed');
    }
  
    // Get the user's hashed password from the database
    const user = userQuery.docs[0].data();
    const hashedPassword = user.Password;
  
    // Compare the hashed password with the provided password
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Error comparing passwords.');
      }
  
      if (result) {
        // Passwords match, user is authenticated
        res.render('home', { userEmail: email });
      } else {
        // Passwords do not match, login failed
        res.render('failed');
      }
    });
  });
  
    
app.post('/signupsuc', async (req, res) => {
  const firstname = req.body.first_name;
  const lastname = req.body.last_name;
  const email = req.body.email;
  const password = req.body.pswd;

  try {
    // Check if the user already exists
    const userQuerySnapshot = await db.collection('logindetails').where('Email', '==', email).get();

    if (userQuerySnapshot.size >= 1) {
      // User already exists
      res.send('You already have an account.');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Add the user to the database with hashed password
    await db.collection('logindetails').add({
      FirstName: firstname,
      LastName: lastname,
      Email: email,
      Password: hashedPassword, // Store the hashed password
    });

    // Redirect to the login page
    res.render('login');
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).send('Error during user registration.');
  }
});
    

const port = process.env.PORT || 5200;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
