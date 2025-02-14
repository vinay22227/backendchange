const express = require('express');
const { getDeployments, createDeployment } = require('../controllers/deploymentController');
const { createTask, getTasks } = require('../controllers/taskController');
const router = express.Router();
 
// Routes for deployments
router.post('/', createDeployment);
router.get('/', getDeployments);
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', createTask);
module.exports = router;
 