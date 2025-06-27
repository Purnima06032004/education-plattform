const AppDataSource = require('../data-source');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');

// Get dashboard data for a user
const getDashboardData = async (req, res) => {
  const { user_id } = req.params;

  console.log('Fetching dashboard data for user:', user_id);

  try {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const progressRepository = AppDataSource.getRepository(Progress);
    const notificationRepository = AppDataSource.getRepository(Notification);

    // Fetch enrolled courses
    const enrollments = await enrollmentRepository.find({
      where: { user_id },
      relations: ['course'],
    });

    // Fetch progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await progressRepository.find({
          where: { user_id, course_id: enrollment.course_id },
        });
        return {
          ...enrollment.course,
          progress,
        };
      })
    );

    // Fetch notifications
    const notifications = await notificationRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });

    // res.status(200).json({ courses: coursesWithProgress, notifications });
    (new ApiSuccess(201, 'Dashboard received successfully', { courses: coursesWithProgress, notifications }, null, null)).send(res);
  } catch (err) {
    console.error('Get dashboard data error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

module.exports = {
  getDashboardData,
};