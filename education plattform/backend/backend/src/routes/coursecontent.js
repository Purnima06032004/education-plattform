const express = require('express');
const { 
    addContent, 
    getContentByCourse 
} = require('../controllers/coursecontentcontroller');

const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Add content to a course
router.post('/', authMiddleware, roleMiddleware(['admin', 'instructor']), addContent);

// Get all content for a course
router.get('/:course_id', getContentByCourse);

module.exports = router;