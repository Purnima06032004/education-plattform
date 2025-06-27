const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Unauthorized: Missing or invalid token')); // Use ApiError
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to the request
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return next(new ApiError(401, 'Unauthorized: Invalid token')); // Use ApiError
    }
};

module.exports = auth;