const jwt = require('jsonwebtoken'); // Ensure jwt is required
const DataStore = require('../models/datastoreModel'); // DataStore model
const User = require('../models/userModel'); // User model
const Project = require('../models/projectModel'); // Project model

// Create DataStore
exports.createDataStore = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const { serviceName, serviceType, projectName, organizationName } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Find project by projectName
    const project = await Project.findOne({ projectName });
    if (!project) {
      return res.status(400).json({ error: 'Project not found' });
    }

    // Determine organization name based on user's subscription type
    let organization = organizationName || 'Default Organization'; // Default organization
    if (user.subscription && user.subscription.type === 'FreeTrial') {
      organization = 'Free Trial Organization'; // Custom for FreeTrial
    } else if (user.subscription && user.subscription.type === 'Organization') {
      organization = user.organizationName || 'Paid Organization'; // For Organization subscription
    }

    // Create a new DataStore with subscription from user
    const dataStore = new DataStore({
      serviceName: serviceName || 'Data Store', // Default to "Data Store" if not provided
      serviceType,
      projectName: project._id, // Reference to the project
      subscription: user.subscription ? user.subscription.type : 'Free', // Default to Free if no subscription
      organizationName: organization,
    });

    await dataStore.save();

    // Return the saved DataStore object along with projectId
    res.status(201).json({
      _id: dataStore._id,
      serviceName: dataStore.serviceName,
      serviceType: dataStore.serviceType,
      projectId: project._id, // Added projectId to the response
      projectName: project.projectName,
      subscription: dataStore.subscription,
      organizationName: dataStore.organizationName,
      createdAt: dataStore.createdAt,
      updatedAt: dataStore.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All DataStore
exports.getAllDataStore = async (req, res) => {
  try {
    const dataStores = await DataStore.find()
      .populate('projectName', 'projectName'); // Populate projectName with the project

    if (!dataStores || dataStores.length === 0) {
      return res.status(200).json([]); // Return empty array if no DataStore found
    }

    const result = dataStores.map((dataStore) => ({
      _id: dataStore._id,
      serviceName: dataStore.serviceName,
      serviceType: dataStore.serviceType,
      projectId: dataStore.projectName?._id || 'N/A', // Added projectId to the response
      projectName: dataStore.projectName?.projectName || 'N/A', // Safe fallback
      subscription: dataStore.subscription || 'N/A',
      organizationName: dataStore.organizationName,
      createdAt: dataStore.createdAt,
      updatedAt: dataStore.updatedAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all DataStores:', error);
    res.status(500).json({ error: 'Failed to fetch DataStores' });
  }
};

// Get DataStore by ID
exports.getDataStoreById = async (req, res) => {
  try {
    const { id } = req.params;  // Fetch the id from the request params

    // Find the DataStore by its _id
    const dataStore = await DataStore.findById(id)
      .populate('projectName', 'projectName'); // Populate projectName with the project info

    if (!dataStore) {
      return res.status(404).json({ error: 'DataStore not found for the given id' });
    }

    // Return the DataStore object in the response
    res.status(200).json({
      _id: dataStore._id,
      serviceName: dataStore.serviceName,
      serviceType: dataStore.serviceType,
      projectId: dataStore.projectName?._id || 'N/A', // Safe fallback to N/A if no project
      projectName: dataStore.projectName?.projectName || 'N/A', // Safe fallback for projectName
      subscription: dataStore.subscription || 'N/A',
      organizationName: dataStore.organizationName,
      createdAt: dataStore.createdAt,
      updatedAt: dataStore.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update DataStore
exports.updateDataStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the DataStore by id
    const dataStore = await DataStore.findById(id);
    if (!dataStore) {
      return res.status(404).json({ error: 'DataStore not found' });
    }

    // If projectName is included in the update, find the project
    if (updates.projectName) {
      const project = await Project.findOne({ projectName: updates.projectName });
      if (!project) {
        return res.status(400).json({ error: 'Project not found' });
      }
      updates.projectName = project._id; // Set the project ID
    }

    // Dynamically set organizationName based on subscription
    const user = await User.findById(dataStore.createdBy); // Assuming createdBy is set when DataStore is created
    let organization = updates.organizationName || 'Default Organization'; // Default organization
    if (user.subscription && user.subscription.type === 'FreeTrial') {
      organization = 'Free Trial Organization';
    } else if (user.subscription && user.subscription.type === 'Organization') {
      organization = user.organizationName || 'Paid Organization';
    }

    updates.organizationName = organization;

    // Update the DataStore with the new data
    const updatedDataStore = await DataStore.findByIdAndUpdate(id, updates, { new: true });
    

    if (!updatedDataStore) {
      return res.status(404).json({ error: 'DataStore not found' });
    }

    const populatedDataStore = await DataStore.findById(updatedDataStore._id)
      .populate('projectName', 'projectName');

    res.status(200).json({
      _id: populatedDataStore._id,
      serviceName: populatedDataStore.serviceName,
      serviceType: populatedDataStore.serviceType,
      projectId: populatedDataStore.projectName?._id || 'N/A', // Added projectId to the response
      projectName: populatedDataStore.projectName.projectName,
      subscription: populatedDataStore.subscription,
      organizationName: populatedDataStore.organizationName,
      createdAt: populatedDataStore.createdAt,
      updatedAt: populatedDataStore.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete DataStore
exports.deleteDataStore = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDataStore = await DataStore.findByIdAndDelete(id);
    if (!deletedDataStore) {
      return res.status(404).json({ error: 'DataStore not found' });
    }

    res.status(200).json({ message: 'DataStore deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
