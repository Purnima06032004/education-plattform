const AppDataSource = require('../data-source');
const Progress = require('../models/Progress');
const CourseContent = require('../models/CourseContent');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');

const { progressCreateSchema } = require('../validation/modelValidations'); 
const { MoreThanOrEqual } = require('typeorm');

// Mark content as completed
const markContentCompleted = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = progressCreateSchema.validate(req.body); // Use progressCreateSchema
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }

    const { user_id, course_id, content_id } = value;

    console.log('Mark content as completed request received:', { user_id, course_id, content_id });

    const progressRepository = AppDataSource.getRepository(Progress);

    // Check if the content is already marked as completed
    const existingProgress = await progressRepository.findOne({
      where: { user_id, course_id, content_id },
    });
    if (existingProgress) {
      console.log('Content already marked as completed');
      return next(new ApiError(400, 'Content already marked as completed'));
    }

    // Create a new progress entry
    const progress = progressRepository.create({
      user_id,
      course_id,
      content_id,
    });

    // Save the progress entry to the database
    await progressRepository.save(progress);
    console.log('Progress created successfully:', progress);

    (new ApiSuccess(201, 'Content marked as completed', progress, null, null)).send(res);
  } catch (err) {
    console.error('Mark content as completed error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

// Get progress for a user in a course
const getProgress = async (req, res, next) => {
  const { user_id, course_id } = req.params;

  console.log('Fetching progress for user:', user_id, 'in course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries for the user in the course
    const progress = await progressRepository.find({
      where: { user_id, course_id },
      relations: ['content'], // Include content details
    });

    (new ApiSuccess(201, 'Content progress is received', progress, null, null)).send(res);
  } catch (err) {
    console.error('Get progress error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getCourseTimeAnalytics = async (req, res, next) => {
  const { course_id } = req.params;

  console.log('Fetching time analytics for course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries for the course
    const progress = await progressRepository.find({
      where: { course_id },
    });

    // Calculate total time spent and average time per user
    const totalTimeSpent = progress.reduce((sum, entry) => sum + entry.time_spent, 0);
    const averageTimeSpent = progress.length > 0 ? totalTimeSpent / progress.length : 0;

    // res.status(200).json({ totalTimeSpent, averageTimeSpent });
    (new ApiSuccess(201, 'Time analytics is received', { totalTimeSpent, averageTimeSpent }, null, null)).send(res);
  } catch (err) {
    console.error('Get course time analytics error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getCourseCompletionPercentage = async (req, res, next) => {
  const { user_id, course_id } = req.params;

  console.log('Calculating completion percentage for user:', user_id, 'in course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);
    const contentRepository = AppDataSource.getRepository(CourseContent);

    // Fetch all content for the course
    const totalContent = await contentRepository.count({ where: { course_id } });

    // Fetch completed content for the user in the course
    const completedContent = await progressRepository.count({
      where: { user_id, course_id },
    });

    // Calculate completion percentage
    const completionPercentage = totalContent > 0
      ? Math.round((completedContent / totalContent) * 100)
      : 0;

    //res.status(200).json({ completionPercentage });
    (new ApiSuccess(201, 'Completion percentage is received', completionPercentage, null, null)).send(res);
  } catch (err) {
    console.error('Get completion percentage error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getCourseAnalytics = async (req, res, next) => {
  const { course_id } = req.params;

  console.log('Fetching analytics for course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries for the course
    const progress = await progressRepository.find({
      where: { course_id },
    });

    // Calculate total time spent and average time per user
    const totalTimeSpent = progress.reduce((sum, entry) => sum + entry.time_spent, 0);
    const averageTimeSpent = progress.length > 0 ? totalTimeSpent / progress.length : 0;

    // res.status(200).json({ totalTimeSpent, averageTimeSpent });
    (new ApiSuccess(201, 'Course analytics is received', { totalTimeSpent, averageTimeSpent }, null, null)).send(res);
  } catch (err) {
    console.error('Get course analytics error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getCourseCompletionRate = async (req, res, next) => {
  const { course_id } = req.params;

  console.log('Fetching completion rate for course:', course_id);

  try {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const progressRepository = AppDataSource.getRepository(Progress);
    const contentRepository = AppDataSource.getRepository(CourseContent);

    // Fetch total number of enrollments for the course
    const totalEnrollments = await enrollmentRepository.count({ where: { course_id } });

    // Fetch total number of content items for the course
    const totalContent = await contentRepository.count({ where: { course_id } });

    // Fetch number of users who completed all content
    const completedUsers = await progressRepository
      .createQueryBuilder('progress')
      .select('progress.user_id')
      .where('progress.course_id = :course_id', { course_id })
      .groupBy('progress.user_id')
      .having('COUNT(progress.content_id) = :totalContent', { totalContent })
      .getCount();

    // Calculate completion rate
    const completionRate = totalEnrollments > 0
      ? Math.round((completedUsers / totalEnrollments) * 100)
      : 0;

    res.status(200).json({ completionRate });
    (new ApiSuccess(201, 'Completion rate is received',completionRate, null, null)).send(res);
  } catch (err) {
    console.error('Get course completion rate error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};
const getPopularCourses = async (req, res, next) => {
  try {
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);

    // Fetch courses with the most enrollments
    const popularCourses = await enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.course_id', 'course_id')
      .addSelect('COUNT(enrollment.user_id)', 'enrollment_count')
      .groupBy('enrollment.course_id')
      .orderBy('enrollment_count', 'DESC')
      .limit(5) // Top 5 popular courses
      .getRawMany();

    // res.status(200).json(popularCourses);
    (new ApiSuccess(201, 'Popular courses are received',popularCourses, null, null)).send(res);
  } catch (err) {
    console.error('Get popular courses error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getUserEngagement = async (req, res, next) => {
  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProgress = await progressRepository.find({
      where: {
        completed_at: MoreThanOrEqual(sevenDaysAgo),
      },
    });

    // Calculate active users
    const activeUsers = [...new Set(recentProgress.map((entry) => entry.user_id))].length;

    // Calculate average interactions per user
    const interactionsPerUser = recentProgress.length / activeUsers;

    //res.status(200).json({ activeUsers, interactionsPerUser });
    (new ApiSuccess(201, 'User engagements are received',{ activeUsers, interactionsPerUser }, null, null)).send(res);
  } catch (err) {
    console.error('Get user engagement error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getRetentionRates = async (req, res, next) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all users
    const users = await userRepository.find();

    // Calculate retention rates
    const retentionRates = await Promise.all(
      users.map(async (user) => {
        const firstInteraction = await progressRepository.findOne({
          where: { user_id: user.id },
          order: { completed_at: 'ASC' },
        });

        if (!firstInteraction) return null;

        const daysSinceFirstInteraction = Math.floor(
          (new Date() - firstInteraction.completed_at) / (1000 * 60 * 60 * 24)
        );

        const recentInteractions = await progressRepository.count({
          where: {
            user_id: user.id,
            completed_at: MoreThanOrEqual(new Date(new Date() - 7 * 24 * 60 * 60 * 1000)),
          },
        });

        return {
          user_id: user.id,
          daysSinceFirstInteraction,
          isActive: recentInteractions > 0,
        };
      })
    );

    // Filter out null values
    const filteredRetentionRates = retentionRates.filter((rate) => rate !== null);

    // Calculate overall retention rate
    const activeUsers = filteredRetentionRates.filter((rate) => rate.isActive).length;
    const totalUsers = filteredRetentionRates.length;
    const retentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // res.status(200).json({ retentionRate, userRetention: filteredRetentionRates });
    (new ApiSuccess(201, 'Retention rates are received',{ retentionRate, userRetention: filteredRetentionRates }, null, null)).send(res);
  } catch (err) {
    console.error('Get retention rates error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};
const getContentPopularity = async (req, res, next) => {
  const { course_id } = req.params;

  console.log('Fetching content popularity for course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries for the course
    const progress = await progressRepository.find({
      where: { course_id },
    });

    // Group by content_id and count interactions
    const contentPopularity = progress.reduce((acc, entry) => {
      acc[entry.content_id] = (acc[entry.content_id] || 0) + 1;
      return acc;
    }, {});

    // Convert to an array of { content_id, interactions }
    const popularityArray = Object.keys(contentPopularity).map((content_id) => ({
      content_id: parseInt(content_id),
      interactions: contentPopularity[content_id],
    }));

    // Sort by interactions (descending)
    popularityArray.sort((a, b) => b.interactions - a.interactions);

    // res.status(200).json(popularityArray);
    (new ApiSuccess(200, 'Popularity content is received',popularityArray, null, null)).send(res);
  } catch (err) {
    console.error('Get content popularity error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

const getUserProgressOverTime = async (req, res, next) => {
  const { user_id, course_id } = req.params;

  console.log('Fetching progress over time for user:', user_id, 'in course:', course_id);

  try {
    const progressRepository = AppDataSource.getRepository(Progress);

    // Fetch all progress entries for the user in the course
    const progress = await progressRepository.find({
      where: { user_id, course_id },
      order: { completed_at: 'ASC' },
    });

    // Create a timeline of progress events
    const timeline = progress.map((entry) => ({
      content_id: entry.content_id,
      completed_at: entry.completed_at,
      time_spent: entry.time_spent,
    }));

    // res.status(200).json(timeline);
    (new ApiSuccess(200, 'User progress over time is received',timeline, null, null)).send(res);
  } catch (err) {
    console.error('Get user progress over time error:', err);
    return next(new ApiError(500, 'Server error'));
  }
};

module.exports = {
  markContentCompleted,
  getProgress,
  getCourseCompletionPercentage,
  getCourseAnalytics,
  getCourseTimeAnalytics,
  getCourseCompletionRate,
  getPopularCourses,
  getUserEngagement,
  getRetentionRates,
  getContentPopularity,
  getUserProgressOverTime,
};