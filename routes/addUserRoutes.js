const express = require('express');
const { createUser, deleteUser, getAllUsers, getUserById } = require('../controllers/addUserControllers');
const { createUserValidator, deleteUserValidator } = require('../validators/addUserValidators');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Route to create a user with validation
router.post('/add-user', createUserValidator, validateRequest, createUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to get a user by ID
router.get('/:id', getUserById);

// Route to delete a user by ID
router.delete('/delete-user/:id', deleteUserValidator, validateRequest, deleteUser);

module.exports = router;