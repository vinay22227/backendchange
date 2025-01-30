const mongoose = require('mongoose');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
 
/**
 * Create a new project and associate it with the user
 */
const createProject = async (req, res) => {
  try {
    const { projectName, organizationName } = req.body;
 
    // Validate input
    if (!projectName) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }
 
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }
 
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'User does not have an active subscription.',
      });
    }
 
    // Determine organization name based on subscription type
    let selectedOrganizationName;
    if (user.subscription.type === 'FreeTrial') {
      selectedOrganizationName = 'Free Trial Organization';
    } else if (user.subscription.type === 'Organization') {
      selectedOrganizationName = organizationName || 'Organization Default Name';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription type.',
      });
    }
 
    // Create new project
    const newProject = new Project({
      projectName,
      organizationName: selectedOrganizationName,
      subscriptionType: user.subscription.type,
      createdBy: req.user._id,
    });
 
    const savedProject = await newProject.save();
 
    // Add project to user's projects array
    user.projects.push({
      projectId: savedProject._id,
      projectName: savedProject.projectName,
      organizationName: savedProject.organizationName,
      createdAt: savedProject.createdAt,
      subscriptionType: user.subscription.type,
    });
 
    await user.save();
 
    res.status(201).json({
      success: true,
      message: 'Project created and added to user successfully.',
      data: savedProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project.',
      error: error.message,
    });
  }
};
 
/**
 * Get all projects created by the authenticated user
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects.',
      error: error.message,
    });
  }
};
 
/**
 * Get a single project by ID
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }
 
    const project = await Project.findOne({ _id: id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized.',
      });
    }
 
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error retrieving project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project.',
      error: error.message,
    });
  }
};
 
/**
 * Update a project by ID (only updates projectName, other fields remain unchanged)
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName } = req.body; // Only get projectName from the request body
 
    if (!projectName) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }
 
    // Find the existing project
    const project = await Project.findOne({ _id: id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized.',
      });
    }
 
    // Update only the projectName
    project.projectName = projectName || project.projectName;
 
    // Save the updated project
    const updatedProject = await project.save();
 
    // Update the user's projects array with the new projectName
    await User.updateOne(
      { _id: req.user._id, 'projects.projectId': id },
      { $set: { 'projects.$.projectName': updatedProject.projectName } }
    );
 
    res.status(200).json({
      success: true,
      message: 'Project name updated successfully.',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project.',
      error: error.message,
    });
  }
};
 
/**
 * Delete a project by ID
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }
 
    const deletedProject = await Project.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized.',
      });
    }
 
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { projects: { projectId: deletedProject._id } } }
    );
 
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
      data: deletedProject,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project.',
      error: error.message,
    });
  }
};
 
module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};