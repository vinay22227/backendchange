const Subscription = require('../models/subscriptionModel');
const OrganizationRequest = require('../models/organizationRequestModel');
const User = require('../models/userModel');

// Valid subscription types
const validSubscriptionTypes = ['Free trial', 'Organization'];

// Function to check if a user already has an active subscription
const checkActiveSubscription = async (userId) => {
  const existingSubscription = await Subscription.findOne({ user: userId });
  if (existingSubscription) {
    return {
      success: false,
      message: 'You already have an active subscription.',
    };
  }
  return null; // No active subscription, proceed with creation
};

// Function to create a new subscription or request admin approval
const createSubscription = async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    const userId = req.user._id;

    // Validate subscription type
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription type. Allowed types: ${validSubscriptionTypes.join(', ')}.`,
      });
    }

    // Check for existing active subscription
    const activeSubscriptionError = await checkActiveSubscription(userId);
    if (activeSubscriptionError) {
      return res.status(400).json(activeSubscriptionError);
    }

    // Fetch user details to ensure the user exists and get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If subscription type is "Organization", send request to admin instead of creating subscription
    if (subscriptionType === 'Organization') {
      const existingRequest = await OrganizationRequest.findOne({ user: userId, status: 'pending' });
      if (existingRequest) {
        return res.status(400).json({ success: false, message: 'Your request is already pending for approval.' });
      }

      // Create a new request for organization approval
      const newRequest = new OrganizationRequest({
        user: userId,
        userEmail: user.email, // Ensure email is stored
        subscriptionType,
        status: 'pending',
        requestedAt: new Date(),
      });

      await newRequest.save();

      return res.status(201).json({
        success: true,
        message: 'Your organization request has been sent to the admin for approval.',
        request: newRequest,
      });
    }

    // Create a new subscription for non-organization types
    const newSubscription = new Subscription({
      user: userId,
      subscriptionType,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year subscription
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      message: `You have successfully subscribed to the ${subscriptionType} plan.`,
      subscription: newSubscription,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your subscription.',
    });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID format.' });
    }

    const request = await OrganizationRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Update status
    request.status = status;
    await request.save();

    res.status(200).json({ success: true, message: 'Request updated successfully.', request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createSubscription,updateRequestStatus };