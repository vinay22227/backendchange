const Organization = require('../models/organizationModel'); // Ensure the Organization model exists
 
exports.createOrganization = async (req, res) => {
  try {
    const { name, address, email } = req.body; // Validate and destructure input
 
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required.' });
    }
 
    const newOrganization = await Organization.create({ name, address, email });
    res.status(201).json({
      success: true,
      message: 'Organization created successfully.',
      data: newOrganization,
    });
  } catch (error) {
    console.error('Error creating organization:', error.message);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};