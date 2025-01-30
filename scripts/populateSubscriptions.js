const mongoose = require('mongoose');
const Subscription = require('../models/subscriptionModel'); // Correct path if necessary

const insertMockSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const subscriptions = [
      { name: 'FreeTrial' },
      { name: 'BasicPlan' },
      { name: 'ProPlan' },
    ];

    await Subscription.insertMany(subscriptions);
    console.log('Mock subscriptions inserted successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting mock subscriptions:', error.message);
    mongoose.connection.close();
  }
};

insertMockSubscriptions();
