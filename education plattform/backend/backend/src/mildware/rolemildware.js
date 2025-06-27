const ApiError = require('../utils/apiError');
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Assuming the user object is attached to the request after authentication
  
      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(403, 'Access denied. Insufficient permissions.');
      }
  
      next(); // User has the required role, proceed to the next middleware/route handler
    };
  };
  
  module.exports = roleMiddleware;