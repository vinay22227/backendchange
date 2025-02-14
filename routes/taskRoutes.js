const express = require('express');
const { createTask, getTasks } = require('../controllers/taskController');
 
const router = express.Router();
 
// Define routes for tasks
router.post('/', createTask);
router.get('/', getTasks);    
 
module.exports = router;