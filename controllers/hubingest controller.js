const jwt = require('jsonwebtoken'); // Ensure jwt is required
const HubIngest = require('../models/hubingestmodel'); // Ensure correct model name
const User = require('../models/userModel'); // User model
const Project = require('../models/projectModel'); // Project model

// Create HubIngest
exports.createHubIngest = async (req, res) => {
  try {
    // Extract the token from Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Remove 'Bearer' from 'Bearer <token>'

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const { name, projectName } = req.body;

    // Verify the JWT token and extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Find the project by projectName
    const project = await Project.findOne({ projectName });
    if (!project) {
      return res.status(400).json({ error: 'Project not found' });
    }

    // Create a new HubIngest and ensure subscriptionType is set
    const hubIngest = new HubIngest({
      name,
      userId: user._id, // Link to the User
      projectName: project._id, // Link to the project using project ID
      subscriptionType: user.subscription ? user.subscription.type : 'Free', // Ensure subscriptionType is set
    });

    // Save the HubIngest document
    await hubIngest.save();

    // Add HubIngest reference to the user's `hubIngests` array
    user.hubIngests.push({
      hubIngestId: hubIngest._id,
      name: hubIngest.name,
      projectName: project.projectName,
      subscriptionType: user.subscription ? user.subscription.type : 'Free', // Add subscription type
    });

    // Save the updated user with the new hubIngest reference
    await user.save();

    // Populate the subscription and projectName fields
    const populatedHubIngest = await HubIngest.findById(hubIngest._id)
      .populate('userId', 'subscription') // Populate user's subscription
      .populate('projectName', 'projectName'); // Populate projectName with the projectName field

    // Return the populated HubIngest with subscriptionType and projectName
    res.status(201).json({
      _id: populatedHubIngest._id,
      name: populatedHubIngest.name,
      subscriptionType: populatedHubIngest.subscriptionType, // Correct subscription type
      projectName: populatedHubIngest.projectName.projectName, // Project name from the populated project
      createdAt: populatedHubIngest.createdAt,
      updatedAt: populatedHubIngest.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All HubIngest
exports.getAllHubIngest = async (req, res) => {
  try {
    // Fetch all HubIngest documents and populate related fields
    const hubIngests = await HubIngest.find()
      .populate('userId', 'subscription') // Populate user's subscription
      .populate('projectName', 'projectName'); // Populate projectName with the projectName field

    // Check if any HubIngest data exists
    if (!hubIngests || hubIngests.length === 0) {
      return res.status(200).json([]); // Return an empty array if no HubIngests found
    }

    // Process the data for response
    const result = hubIngests.map((hubIngest) => ({
      _id: hubIngest._id,
      name: hubIngest.name,
      subscriptionType: hubIngest.userId?.subscription || 'N/A', // Safe fallback for subscription type
      projectName: hubIngest.projectName?.projectName || 'N/A', // Safe fallback for projectName
      createdAt: hubIngest.createdAt,
      updatedAt: hubIngest.updatedAt,
    }));

    // Send the processed HubIngest data
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all HubIngests:', error);
    res.status(500).json({ error: 'Failed to fetch HubIngests' });
  }
};

// Get HubIngest by UserId
exports.getHubIngestByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the HubIngest by userId and populate related fields
    const hubIngest = await HubIngest.findOne({ userId })
      .populate('userId', 'subscription')
      .populate('projectName', 'projectName');

    if (!hubIngest) {
      return res.status(404).json({ error: 'HubIngest not found for the given userId' });
    }

    res.status(200).json({
      _id: hubIngest._id,
      name: hubIngest.name,
      subscriptionType: hubIngest.userId.subscription.type,
      projectName: hubIngest.projectName.projectName,
      createdAt: hubIngest.createdAt,
      updatedAt: hubIngest.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update HubIngest
exports.updateHubIngest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the HubIngest to update
    const hubIngest = await HubIngest.findById(id);
    if (!hubIngest) {
      return res.status(404).json({ error: 'HubIngest not found' });
    }

    // If userId is provided, update the subscription type from the user's subscription
    if (updates.userId) {
      const user = await User.findById(updates.userId).populate('subscription');
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Update the user's subscription for the HubIngest
      updates.subscriptionType = user.subscription.type; // Set the subscription type from user
    }

    // Update projectName if provided
    if (updates.projectName) {
      const project = await Project.findOne({ projectName: updates.projectName });
      if (!project) {
        return res.status(400).json({ error: 'Project not found' });
      }
      updates.projectName = project._id; // Set the project ID
    }

    // Update the HubIngest document
    const updatedHubIngest = await HubIngest.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedHubIngest) {
      return res.status(404).json({ error: 'HubIngest not found' });
    }

    // Populate the updated HubIngest with subscription and project details
    const populatedHubIngest = await HubIngest.findById(updatedHubIngest._id)
      .populate('userId', 'subscription')
      .populate('projectName', 'projectName');

    // Return the updated HubIngest
    res.status(200).json({
      _id: populatedHubIngest._id,
      name: populatedHubIngest.name,
      subscriptionType: populatedHubIngest.userId.subscription.type,
      projectName: populatedHubIngest.projectName.projectName,
      status: populatedHubIngest.status,
      createdAt: populatedHubIngest.createdAt,
      updatedAt: populatedHubIngest.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete HubIngest
exports.deleteHubIngest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the HubIngest by ID
    const deletedHubIngest = await HubIngest.findByIdAndDelete(id);
    if (!deletedHubIngest) {
      return res.status(404).json({ error: 'HubIngest not found' });
    }

    // Return success response
    res.status(200).json({ message: 'HubIngest deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
