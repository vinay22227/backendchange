const { check } = require('express-validator');

exports.signupValidator = [
  check('fullName').trim().notEmpty().withMessage('Full name is required'),
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('mobile').optional().isMobilePhone().withMessage('Please provide a valid mobile number'),
  check('country').optional().trim(),
  check('state').optional().trim(),
  check('companyName').optional().trim(),
  check('designation').optional().trim()
];

exports.signinValidator = [
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').notEmpty().withMessage('Password is required')
];