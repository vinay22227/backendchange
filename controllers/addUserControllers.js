const { 
    createUserService, 
    deleteUserService, 
    getAllUsersService, 
    getUserByIdService 
  } = require('../services/addUserServices');
  
  // Create a user
  exports.createUser = async (req, res, next) => {
    try {
      const { userName, userAdminName, userType, companyName } = req.body;
      const newUser = await createUserService({ userName, userAdminName, userType, companyName });
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Get all users
  exports.getAllUsers = async (req, res, next) => {
    try {
      const users = await getAllUsersService();
      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Get user by ID
  exports.getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await getUserByIdService(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Delete user by ID
  exports.deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedUser = await deleteUserService(id);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser
      });
    } catch (error) {
      next(error);
    }
  };
  