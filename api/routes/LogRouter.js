const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ActivityLog = require('../models/ActivityLog');

const dotenv = require('dotenv');
dotenv.config();

const secret = process.env.SECRET;

// Log user action
router.post('/log', async (req, res) => {
    try {
        const { action } = req.body;
        const ipAddress = req.ip;
        const { token } = req.cookies;
        let userId = null;

        if (token) {
            try {
                const info = jwt.verify(token, secret, {});
                userId = info.id;
            } catch (error) {
                console.warn('Invalid or expired JWT token:', error.message);
            }
        }
        if (userId !== null) {
            const logEntry = new ActivityLog({
                userId,
                ipAddress,
                action
            });

            // Make the save operation non-blocking
            await logEntry.save().catch(error => {
                console.error('Error saving log entry:', error);
            });
        }
        res.status(200).json({ message: 'Action logged successfully' });
    } catch (error) {
        console.error('Error logging action:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//get all logs for the admin management page
router.get('/logs', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        const logs = await ActivityLog.find({
            createdAt: {
                $gte: startDateTime,
                $lte: endDateTime
            }
        }).populate('userId', ['username', 'cover', 'userRole']).sort({ createdAt: -1 });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//delete log by id
router.delete('/logs/:id', async (req, res) => {
    try {
        const deletedLog = await ActivityLog.findByIdAndDelete(req.params.id);
        if (!deletedLog) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
