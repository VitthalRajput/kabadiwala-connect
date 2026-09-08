import { ApiError } from '../utils/ApiError.js';

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied. Insufficient permissions");
    }
    
    next();
  };
};

export { checkRole };