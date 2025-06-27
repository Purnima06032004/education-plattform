const express = require('express');
const { 
    markContentCompleted, 
    getProgress,
    getCourseCompletionPercentage,
    getUserProgressOverTime
  } = require('../controllers/progresscontroller');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Mark content as completed
router.post('/', authMiddleware, roleMiddleware(['admin', 'instructor','student']), markContentCompleted);

// Get progress for a user in a course
router.get('/:user_id/:course_id',authMiddleware, roleMiddleware(['admin', 'instructor','student']), getProgress);

router.get('/completion/:user_id/:course_id', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getCourseCompletionPercentage);
router.get('/progress-over-time/:user_id/:course_id', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getUserProgressOverTime);


module.exports = router;