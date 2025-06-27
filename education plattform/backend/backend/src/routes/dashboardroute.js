const express = require('express');
const { getDashboardData } = require('../controllers/DashboardController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Get dashboard data for a user
router.get('/:user_id', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getDashboardData);

module.exports = router;