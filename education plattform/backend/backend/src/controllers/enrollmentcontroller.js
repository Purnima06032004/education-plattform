const AppDataSource = require('../data-source');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');
const { enrollmentCreateSchema } = require('../validation/modelValidations'); 

// Enroll a user in a course
const enrollUser = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = enrollmentCreateSchema.validate(req.body);
        if (error) {
            return next(new ApiError(400, error.details[0].message)); // Bad Request
        }

        const { user_id, course_id } = value; // Use validated values

        const enrollmentRepository = AppDataSource.getRepository(Enrollment);
        const userRepository = AppDataSource.getRepository(User);
        const courseRepository = AppDataSource.getRepository(Course);

        // Check if the user exists
        const user = await userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            console.log('User not found');
            return next(new ApiError(404, 'User not found'));
        }

        // Check if the course exists
        const course = await courseRepository.findOne({ where: { id: course_id } });
        if (!course) {
            console.log('Course not found');
            return next(new ApiError(404, 'Course not found'));
        }

        // Check if the user is already enrolled in the course
        const existingEnrollment = await enrollmentRepository.findOne({
            where: { user_id, course_id },
        });
        if (existingEnrollment) {
            console.log('User already enrolled in the course');
            return next(new ApiError(400, 'User already enrolled in the course'));
        }

        // Create a new enrollment
        const enrollment = enrollmentRepository.create({
            user_id,
            course_id,
        });

        // Save the enrollment to the database
        await enrollmentRepository.save(enrollment);

        (new ApiSuccess(201, 'l received created', enrollment, null, null)).send(res);
    } catch (err) {
        console.error('Enrollment error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

// Get all enrollments for a user
const getEnrollmentsByUser = async (req, res, next) => {
    const { user_id } = req.params;

    try {
        const enrollmentRepository = AppDataSource.getRepository(Enrollment);

        // Fetch all enrollments for the user
        const enrollments = await enrollmentRepository.find({
            where: { user_id },
            relations: ['course'], // Include course details
        });

        (new ApiSuccess(200, 'Enrollments received sucessfully', enrollments, null, null)).send(res);
    } catch (err) {
        console.error('Get enrollments by user error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

// Get all enrollments for a course
const getEnrollmentsByCourse = async (req, res, next) => {
    const { course_id } = req.params;

    try {
        const enrollmentRepository = AppDataSource.getRepository(Enrollment);

        // Fetch all enrollments for the course
        const enrollments = await enrollmentRepository.find({
            where: { course_id },
            relations: ['user'], // Include user details
        });
        
        (new ApiSuccess(200, 'Enrollments received sucessfully', enrollments, null, null)).send(res);
    } catch (err) {
        console.error('Get enrollments by course error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

module.exports = {
    enrollUser,
    getEnrollmentsByUser,
    getEnrollmentsByCourse,
};