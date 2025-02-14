const Task = require('../models/taskModel');
 
// Create a new task
const createTask = async (req, res) => {
  const { taskName, assignedTo, status, area, description } = req.body;
 
  try {
    const newTask = new Task({ taskName, assignedTo, status, area, description });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
module.exports = { createTask, getTasks };