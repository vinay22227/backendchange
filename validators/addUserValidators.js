const { body, param, validationResult } = require('express-validator');

// Validator for creating a user
exports.createUserValidator = [
  body('userName').isString().notEmpty().withMessage('User name is required'),
  body('userAdminName').isString().notEmpty().withMessage('Admin name is required'),
  body('userType').isIn(['Admin', 'Editor', 'Viewer']).withMessage('Invalid user type'),
  body('companyName').isString().notEmpty().withMessage('Company name is required')
];

// Validator for deleting a user
exports.deleteUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID')
];

// Middleware to handle validation errors
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};