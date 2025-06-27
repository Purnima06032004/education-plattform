const AppDataSource = require('../data-source');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');
const { sendEmail } = require('../services/emailService');
const { notificationCreateSchema } = require('../validation/modelValidations');

// Send a notification to a user
const sendNotification = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = notificationCreateSchema.validate(req.body);
        if (error) {
            return next(new ApiError(400, error.details[0].message));
        }

        const { user_id, message } = value;

        const notificationRepository = AppDataSource.getRepository(Notification);
        const userRepository = AppDataSource.getRepository(User);

        // verify the user exists
        const user = await userRepository.findOne({ where: { id: user_id } });
        if (!user) {
            console.log('User not found');
            return next(new ApiError(404, 'User not found'));
        }
        // Create a new notification
        const notification = notificationRepository.create({
            user_id,
            message,
        });

        // Save the notification to the database
        await notificationRepository.save(notification);
        console.log('Notification sent successfully:', notification);

        // Send an email to the user
        await sendEmail(user.email, 'New Notification', message);

        (new ApiSuccess(201, 'Notification sent successfully', notification, null, null)).send(res);
    } catch (err) {
        console.error('Send notification error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

// Get all notifications for a user
const getNotificationsByUser = async (req, res, next) => {
    const { user_id } = req.params;

    console.log('Fetching notifications for user:', user_id);

    try {
        const notificationRepository = AppDataSource.getRepository(Notification);

        // Fetch all notifications for the user
        const notifications = await notificationRepository.find({
            where: { user_id },
            order: { created_at: 'DESC' }, // Show latest notifications first
        });

        (new ApiSuccess(200, 'Notification received successfully', notifications, null, null)).send(res);
    } catch (err) {
        console.error('Get notifications error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

module.exports = {
    sendNotification,
    getNotificationsByUser,
};