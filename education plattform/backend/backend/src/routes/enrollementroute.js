const express = require('express');
const {
  enrollUser,
  getEnrollmentsByUser,
  getEnrollmentsByCourse,
} = require('../controllers/enrollmentcontroller');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Enroll a user in a course
router.post('/', authMiddleware, roleMiddleware(['admin', 'instructor','student']), enrollUser);

// Get all enrollments for a user
router.get('/user/:user_id',authMiddleware, roleMiddleware(['admin', 'instructor']),  getEnrollmentsByUser);

// Get all enrollments for a course
router.get('/course/:course_id',authMiddleware, roleMiddleware(['admin', 'instructor']),  getEnrollmentsByCourse);

module.exports = router;