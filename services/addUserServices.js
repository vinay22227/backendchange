const AddUser = require('../models/addUserModels');

// Service to create a new user
exports.createUserService = async (userData) => {
  try {
    const newUser = new AddUser(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

// Service to get all users
exports.getAllUsersService = async () => {
  try {
    return await AddUser.find();
  } catch (error) {
    throw new Error('Error fetching users: ' + error.message);
  }
};

// Service to get a user by ID
exports.getUserByIdService = async (id) => {
  try {
    return await AddUser.findById(id);
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};

// Service to delete a user
exports.deleteUserService = async (id) => {
  try {
    // Attempt to find and delete the user by ID
    const deletedUser = await AddUser.findByIdAndDelete(id);

    // If no user is found, return null
    if (!deletedUser) {
      return null;  // User not found
    }

    return deletedUser;  // Return the deleted user
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message);
  }
};

// Service to update a user
exports.updateUserService = async (id, userData) => {
  try {
    // Update user by ID with the provided data
    const updatedUser = await AddUser.findByIdAndUpdate(id, userData, { new: true });

    // If no user is found to update, return null
    if (!updatedUser) {
      return null;  // User not found
    }

    return updatedUser;  // Return updated user
  } catch (error) {
    throw new Error('Error updating user: ' + error.message);
  }
};