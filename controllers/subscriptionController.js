const Subscription = require('../models/subscriptionModel');
 
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
 
// Function to create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    const userId = req.user._id; // User ID from the token
 
    // Validate subscription type
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription type. Allowed types are: ${validSubscriptionTypes.join(', ')}.`,
      });
    }
 
    // Check for existing active subscription
    const activeSubscriptionError = await checkActiveSubscription(userId);
    if (activeSubscriptionError) {
      return res.status(400).json(activeSubscriptionError);
    }
 
    // Create a new subscription for the user
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
 
module.exports = { createSubscription };