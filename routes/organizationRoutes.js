const express = require('express');
const Organization = require('../models/organizationModel'); // Assuming you have an Organization model
const { logNotification } = require('../middlewares/notificationLogger'); // Import the notification logging helper

const router = express.Router();

// Create a new organization
router.post('/organizations', async (req, res) => {
  console.log('Received request body:', req.body);

  const { organizationName, organizationDetails, contactNo, organizationEmail, paymentMethod } = req.body;

  const organization = new Organization({
    organizationName,
    organizationDetails,
    contactNo,
    organizationEmail,
    paymentMethod,
  });

  try {
    // Save the organization to the database
    const savedOrganization = await organization.save();

    // Log a notification for the admin or contact email
    await logNotification(
      organizationEmail, // Using the organization's email as the notification recipient
      `Organization "${organizationName}" has been successfully created.`,
      'organization_create'
    );

    res.status(201).json(savedOrganization);
  } catch (error) {
    console.error('Error creating organization:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Retrieve all organizations
router.get('/organizations', async (req, res) => {
  try {
    // Fetch all organizations from the database
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
