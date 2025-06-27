const AppDataSource = require('../data-source');
const Course = require('../models/Course');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');
const { courseCreateSchema, courseUpdateSchema } = require('../validation/modelValidations'); 

// Create a new course
const createCourse = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = courseCreateSchema.validate(req.body); //Joi Validation
        if (error) {
            return next(new ApiError(400, error.details[0].message)); // Bad Request
        }
        const { title, description, instructor_id } = value;

        const courseRepository = AppDataSource.getRepository(Course);
        const course = courseRepository.create({
            title,
            description,
            instructor_id,
        });

        await courseRepository.save(course);
        
        (new ApiSuccess(201, 'Course created successfully', course, null, null)).send(res);
    } catch (err) {
        console.error('Create course error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

// Get all courses
const getAllCourses = async (req, res, next) => {
    try {
        const courseRepository = AppDataSource.getRepository(Course);
        const courses = await courseRepository.find();
        (new ApiSuccess(200, 'Courses received successfully', courses, null, null)).send(res); 
    } catch (err) {
        console.error('Get all courses error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

const getCourseById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({ where: { id } }); // Use findOne

        if (!course) {
            return next(new ApiError(404, 'Course not found'));
        }

        (new ApiSuccess(200, 'Course received successfully', course, null, null)).send(res); 
    } catch (err) {
        console.error(err);
        return next(new ApiError(500, 'Server error'));
    }
};

const updateCourse = async (req, res, next) => {
    const { id } = req.params;

    try {
        const { error, value } = courseUpdateSchema.validate(req.body);
        if (error) {
            return next(new ApiError(400, error.details[0].message));
        }

        const { title, description } = value;
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({ where: { id } });

        if (!course) {
            return next(new ApiError(404, 'Course not found'));
        }
        course.title = title || course.title;
        course.description = description || course.description;

        await courseRepository.save(course);
        (new ApiSuccess(200, 'Course updated successfully', course, null, null)).send(res); 
    } catch (err) {
        console.error(err);
        return next(new ApiError(500, 'Server error'));
    }
};

const deleteCourse = async (req, res, next) => {
    const { id } = req.params;
    try {
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({ where: { id } });

        if (!course) {
            return next(new ApiError(404, 'Course not found'));
        }

        await courseRepository.remove(course);
        (new ApiSuccess(200, 'Course deleted successfully', null, null, null)).send(res); 
    } catch (err) {
        console.error(err);
        return next(new ApiError(500, 'Server error'));
    }
};


const getFeaturedCourses = async (req, res, next) => {
    try {
        const courseRepository = AppDataSource.getRepository(Course);

        // Fetch featured courses (e.g., courses with the most enrollments)
        const featuredCourses = await courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.enrollments', 'enrollment')
            .select(['course.id', 'course.title', 'COUNT(enrollment.user_id) AS enrollments'])
            .groupBy('course.id')
            .orderBy('enrollments', 'DESC')
            .limit(5) // Top 5 featured courses
            .getRawMany();

        (new ApiSuccess(200, 'Featured courses received successfully', featuredCourses, null, null)).send(res); 
    } catch (err) {
        console.error('Get featured courses error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getFeaturedCourses,
};