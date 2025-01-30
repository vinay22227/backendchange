const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Ensure the User model is imported

const authenticateUser = async (req, res, next) => {
  try {
    // Extract the Authorization header
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader); // Debugging: Log the header

    // Validate the Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied. Missing or invalid Authorization header.',
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied. No token provided.',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Debugging: Log the decoded payload

    // Ensure the token contains the required user ID
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token is missing user details.',
      });
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.id).populate('subscription'); // Adjust 'subscription' field if necessary
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Attach the user document to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err); // Debugging: Log the error

    // Handle token-specific errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please provide a valid token.',
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during authentication.',
      error: err.message, // Include the error message for debugging
    });
  }
};

module.exports = authenticateUser;
