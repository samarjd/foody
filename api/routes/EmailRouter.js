const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const fs = require('fs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const Mail = require('../models/Mail');

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

//send contact message to admin
router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        await Mail.create({ name, email, subject, message, type: "contact" });
    } catch (error) {
        console.error('Error saving contact message to MongoDB:', error);
        return res.status(500).json({ message: 'An error occurred while saving the message.' });
    }

    const emailTemplate = readEmailTemplate('./templates/contactTemplate.ejs');
    const renderedEmail = ejs.render(emailTemplate, { name, email, subject, message });

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.EMAIL_ADDRESS,
        subject: 'New Contact Message from Foody Blog App',
        html: renderedEmail,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent successfully');
        return res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending email notification:', error);
        return res.status(500).json({ message: 'An error occurred while sending the email notification.' });
    }
});

//get all emails for the admin management page
router.get("/emails", async (req, res) => {
    try {
        const mails = await Mail.find();
        res.json(mails);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});

module.exports = router;
