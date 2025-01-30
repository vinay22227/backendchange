const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/jwt.config');
const Project = require('../models/projectModel');
 
// Utility function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};
 
// Register a new user
exports.registerUser = async (data) => {
  try {
    const { fullName, email, password, mobile, country, state, companyName, designation } = data;
 
    // Validate input fields
    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required.');
    }
 
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }
 
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Create and save the new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      country,
      state,
      companyName,
      designation,
    });
 
    const savedUser = await newUser.save();
 
    // Return the user data without the password
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;
 
    return userWithoutPassword;
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    throw new Error(`Registration failed: ${error.message}`);
  }
};
 
// Authenticate an existing user
exports.authenticateUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
 
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
 
    // Compare the provided password with the stored hash
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
 
    // Generate a JWT token
    const token = generateToken(user._id);
 
    // Remove the password field before returning the user object
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
 
    return {
      success: true,
      message: 'Authentication successful',
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    console.error('Error in authenticateUser:', error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
};
 
// Fetch user details by email (Updated to return only selected fields)
exports.fetchUserDetailsByEmail = async (email) => {
  try {
    console.log(`Fetching details for email: ${email}`); // Debugging log
 
    if (!email) {
      throw new Error('Email is required to fetch user details.');
    }
 
    // Fetch the user and log the query result
    const user = await User.findOne({ email }).select('fullName email mobile subscription');
    console.log('Query result:', user);
 
    if (!user) {
      throw new Error('User not found.');
    }
 
    return user;
  } catch (error) {
    console.error('Error in fetchUserDetailsByEmail:', error.message);
    throw new Error(`Fetching user details failed: ${error.message}`);
  }
};
 
// Update subscription and create a project
exports.updateSubscriptionAndCreateProject = async (userId, subscriptionName, projectName, organizationName) => {
  try {
    if (!userId || !subscriptionName || !projectName || !organizationName) {
      throw new Error('All fields are required: userId, subscriptionName, projectName, organizationName.');
    }
 
    // Find and update the user's subscription
    const user = await User.findByIdAndUpdate(
      userId,
      { subscription: subscriptionName },
      { new: true } // Return the updated user
    );
 
    if (!user) {
      throw new Error('User not found.');
    }
 
    // Create a new project for the user
    const project = await Project.create({
      projectName,
      organizationName,
      subscriptionName,
    });
 
    console.log('Subscription updated and project created:', { user, project });
 
    return {
      user: user.toObject(),
      project: project.toObject()
    };
  } catch (error) {
    console.error('Error in updateSubscriptionAndCreateProject:', error.message);
    throw new Error(`Failed to update subscription and create project: ${error.message}`);
  }
};