const Deployment = require('../models/deploymentModel');
 
// Get all deployments
const getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find();
    res.status(200).json(deployments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
// Create a new deployment
const createDeployment = async (req, res) => {
  const { projectName, projectCategory, description } = req.body;
 
  // Validate projectName and projectCategory
  if (!projectName || !projectCategory) {
    return res.status(400).json({
      message: 'Project Name and Project Category are required.',
    });
  }
 
  // Validate description length
  if (description && description.split(' ').length > 500) {
    return res.status(400).json({
      message: 'Description cannot exceed 500 words.',
    });
  }
 
  try {
    const newDeployment = new Deployment({ projectName, projectCategory, description });
    await newDeployment.save();
    res.status(201).json(newDeployment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
module.exports = { getDeployments, createDeployment };