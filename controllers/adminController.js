const OrganizationRequest = require('../models/organizationRequestModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const approveOrganizationRequest = async (req, res) => {
    try {
      const { requestId } = req.params;
  
      // Find the organization request
      const orgRequest = await OrganizationRequest.findById(requestId);
      if (!orgRequest) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
  
      // Ensure the user exists
      const user = await User.findById(orgRequest.user);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      console.log("Debug Log: User ID:", user._id); // Verify if user ID is retrieved
      console.log("Debug Log: Subscription Type:", 'Organization');
  
      // Ensure user ID is properly assigned
      if (!user._id) {
        return res.status(400).json({ success: false, message: 'Invalid user ID in request.' });
      }
  
      // Create a new subscription for the user
      const newSubscription = new Subscription({
        user: user._id, // Ensure correct field name
        subscriptionType: 'Organization', // Match enum value exactly
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year subscription
      });
  
      console.log("Debug Log: New Subscription:", newSubscription); // Log the subscription before saving
  
      await newSubscription.save();
  
      // Update request status to approved
      orgRequest.status = 'approved';
      await orgRequest.save();
  
      res.status(200).json({
        success: true,
        message: 'Organization request approved successfully.',
        subscription: newSubscription,
      });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const rejectOrganizationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await OrganizationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed.' });
    }

    // Update request status to rejected
    request.status = 'rejected';
    await request.save();

    res.status(200).json({ success: true, message: 'Organization request rejected.' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getAllOrganizationRequests = async (req, res) => {
  try {
      const requests = await OrganizationRequest.find(); // Fetch all requests
      res.status(200).json(requests);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

module.exports = { approveOrganizationRequest, rejectOrganizationRequest, getAllOrganizationRequests};
