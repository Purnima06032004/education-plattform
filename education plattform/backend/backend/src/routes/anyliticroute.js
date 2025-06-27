const express = require('express');
const {
  getCourseTimeAnalytics,
  getCourseCompletionRate,
  getPopularCourses,
  getUserEngagement,
  getRetentionRates,
  getContentPopularity,
  getUserProgressOverTime,
} = require('../controllers/progresscontroller');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Get time analytics for a course
router.get('/time/:course_id', authMiddleware, roleMiddleware(['admin', 'instructor']), getCourseTimeAnalytics);

// Get completion rate for a course
router.get('/completion-rate/:course_id', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getCourseCompletionRate);

// Get popular courses
router.get('/popular',authMiddleware, roleMiddleware(['admin', 'instructor', 'user']), getPopularCourses);

// Get user engagement metrics
router.get('/engagement', authMiddleware, roleMiddleware(['admin', 'instructor']), getUserEngagement);

// Get retention rates
router.get('/retention', authMiddleware, roleMiddleware(['admin', 'instructor']), getRetentionRates);

// Get content popularity for a course
router.get('/content-popularity/:course_id', authMiddleware, roleMiddleware(['admin', 'instructor']), getContentPopularity);

// Get user progress over time
router.get('/progress-over-time/:user_id/:course_id',authMiddleware, roleMiddleware(['admin', 'instructor']), getUserProgressOverTime);

module.exports = router;