const AppDataSource = require('../data-source');
const { courseContentCreateSchema, courseContentUpdateSchema } = require('../validation/modelValidations');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');
const CourseContent = require('../models/CourseContent');

// Add content to a course
const addContent = async (req, res, next) => {

  try {
    const { error, value } = courseContentCreateSchema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }

    const { course_id, type, content, order } = value;
    const contentRepository = AppDataSource.getRepository(CourseContent);

    // Create a new content entry
    const courseContent = contentRepository.create({
      course_id,
      type,
      content,
      order,
    });

    await contentRepository.save(courseContent);
    (new ApiSuccess(201, 'Content created successfully', courseContent, null, null)).send(res);
  } catch (err) {
    console.error('Add content error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

// Get all content for a course
const getContentByCourse = async (req, res, next) => {
  const { course_id } = req.params;

  try {
    const contentRepository = AppDataSource.getRepository(CourseContent);
    // Fetch all content for the course
    const content = await contentRepository.find({
      where: { course_id },
      order: { order: 'ASC' }, // Order by the 'order' field
    });

    (new ApiSuccess(201, 'Content received successfully', content, null, null)).send(res);
  } catch (err) {
    console.error('Get content by course error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

module.exports = {
  addContent,
  getContentByCourse,
};