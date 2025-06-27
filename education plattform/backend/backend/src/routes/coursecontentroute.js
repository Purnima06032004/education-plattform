const express = require('express');
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getFeaturedCourses,
    getUsersByCourse,
} = require('../controllers/coursecontroller');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');


const router = express.Router();

// Create a new course
router.post('/', authMiddleware, roleMiddleware(['admin', 'instructor','student']), createCourse);

router.get('/featured', authMiddleware, roleMiddleware(['admin', 'instructor','student']), getFeaturedCourses);


// Get all courses

router.get('/',  authMiddleware, roleMiddleware(['admin', 'instructor', 'student']), getAllCourses);

// Get a single course by ID
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'instructor', 'student']), getCourseById);

// Update a course
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'instructor']), updateCourse);

// Delete a course
router.delete('/:id', authMiddleware, roleMiddleware(['admin','instructor']), deleteCourse);

module.exports = router;