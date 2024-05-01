const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const crypto = require('crypto');
const User = require('../models/User');
const TokenModel = require('../models/Token');
const Mail = require('../models/Mail');

const profileUploadMiddleware = multer({ dest: 'uploads/profiles/' });

const dotenv = require('dotenv');
dotenv.config();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

//mail transpoter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//read email template file
function readEmailTemplate(fileName) {
  try {
    return fs.readFileSync(fileName, 'utf8');
  } catch (error) {
    console.error('Error reading email template file:', error);
    return null;
  }
}

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, email, dob, firstname, lastname } = req.body;
  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationLink = `${process.env.ORIGIN}/verify-token/${verificationToken}`;

    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
      email,
      dob,
      firstname,
      lastname,
      userRole: "User",
      isVerified: false,
    });

    const tokenDoc = await TokenModel.create({
      userId: userDoc._id,
      token: verificationToken,
      expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    });

    const adminEmailTemplate = readEmailTemplate('./templates/adminRegisterTemplate.ejs');
    const adminRenderedEmail = ejs.render(adminEmailTemplate, { username, email, dob, firstname, lastname });
    const adminMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: process.env.EMAIL_ADDRESS,
      subject: 'New User Registration in Foody Blog App',
      html: adminRenderedEmail,
    };
  
    try {
      await transporter.sendMail(adminMailOptions);
      console.log('Admin Email notification sent successfully');
    } catch (error) {
      console.error('Error sending admin email notification:', error);
    }

    try {
      await Mail.create({ 
        name: username, 
        email: process.env.EMAIL_ADDRESS, 
        subject:"New User Registration in Foody Blog App", 
        message: "New Registration! \n" +
        "Username: " + username + "\n" +
        "Email: " + email + "\n" +
        "Date of Birth: " + dob + "\n" +
        "First Name: " + firstname + "\n" +
        "Last Name: " + lastname + "",
        type:"Registration" 
      });
    } catch (error) {
      console.error('Error saving mail to MongoDB:', error);
      return res.status(500).json({ message: 'An error occurred while saving the message.' });
    }

    const userEmailTemplate = readEmailTemplate('./templates/userRegisterTemplate.ejs');
    const userRenderedEmail = ejs.render(userEmailTemplate, { lastname, firstname, token: verificationToken, verificationLink });
    const userMailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Welcome to Foody Blog! Verify your email address',
      html: userRenderedEmail,
    };

    try {
      await transporter.sendMail(userMailOptions);
      console.log('User Email notification sent successfully');
      return res.status(201).json({ message: 'Registration successful. Email notification sent successfully.' });
    } catch (error) {
      console.error('Error sending user email notification:', error);
      return res.status(500).json({ message: 'An error occurred while sending the email notification.' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
});

// Verify token for email verification
router.post('/verify-token/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const tokenDoc = await TokenModel.findOne({ token: id });
    if (!tokenDoc) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    if (tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    const userDoc = await User.findById(tokenDoc.userId);
    if (!userDoc) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (userDoc.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }
    userDoc.isVerified = true;
    await userDoc.save();
    await tokenDoc.deleteOne({_id:tokenDoc._id});

    return res.status(200).json({ message: 'Token verified successfully'});
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message});
  }
});

// Reactivate verification token after expiration date
router.put('/verify-token/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const tokenDoc = await TokenModel.findOne({ token: id });
    if (!tokenDoc) {
      return res.status(400).json({ error: 'Token not found' });
    }

    tokenDoc.expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    await tokenDoc.save();

    return res.status(200).json({ message: 'Token reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

//find user by id
router.post('/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userDoc = await User.findById(id);
    res.json(userDoc);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//update user's profile picture and information
router.put('/profile', profileUploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;

  if (req.file) {
    const { originalname, filename } = req.file;
    const ext = path.extname(originalname);
    newPath = path.join('uploads/profiles/', filename + ext);

    try {
      fs.renameSync(req.file.path, newPath);
    } catch (error) {
      console.error('Error moving file:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  try {
    const { token } = req.cookies;
    const info = jwt.verify(token, secret, {});
    let userDoc = await User.findById(info.id);

    if (!userDoc) {
      return res.status(404).json('User not found');
    }
    
    const formData = req.body;
    if (Object.keys(formData).length > 0) {
      const { firstname, lastname, email, dob, password } = formData;
      userDoc.firstname = firstname;
      userDoc.lastname = lastname;
      userDoc.email = email;
      userDoc.dob = dob;
      userDoc.password = bcrypt.hashSync(password, salt);
    }

    if (!userDoc.userRole) {
      userDoc.userRole = "User";
    }
    
    if (newPath) {
      userDoc.cover = newPath;
    }
    
    userDoc = await userDoc.save();
    res.json(userDoc);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Login to user's account
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const userDoc = await User.findOne({ username });
      if (!userDoc) {
          return res.status(400).json({ error: 'User not found' });
      }
      
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
          if (!userDoc.isVerified) {
            return res.status(400).json({ error: 'Email not verified. Please verify your email address before logging in.' });
          }
          userDoc.lastOnline = new Date().toISOString();
          await userDoc.save();
          jwt.sign({ username, id: userDoc._id, userRole: userDoc.userRole }, secret, {}, (err, token) => {
              if (err) throw err;
              res.cookie('token', token).json({
                  id: userDoc._id,
                  username,
                  userRole: userDoc.userRole,
              });
          });
      } else {
        res.status(400).json({ error: 'Incorrect password' });
      }
  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check whether a user is logged in or not
router.get('/profile', (req, res) => {
  const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json(info);
    });
});

//logout from user's account
router.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

//get all users for the admin management page
router.get('/manageUsers', async (req, res) => {
  try {
    const userData = await User.find();
    res.json(userData);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//delete user by id
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.deleteOne({ _id: id });

    res.json('User deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

//update user role by id
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { userRole } = req.body;
  try {
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }
    userToUpdate.userRole = userRole;
    userToUpdate.updatedAt = new Date();
    await userToUpdate.save();

    res.json('User role updated successfully');
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;