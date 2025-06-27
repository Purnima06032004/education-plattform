const express = require('express');
const { 
    sendNotification,
    getNotificationsByUser 
} = require('../controllers/notificationcontroller');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Send a notification to a user
router.post('/', authMiddleware, roleMiddleware(['admin', 'instructor']), sendNotification);

// Get all notifications for a user
router.get('/:user_id', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getNotificationsByUser);

module.exports = router;