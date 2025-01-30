const Notification = require('../models/notificationModels');

// Logs a notification for a user (email)
const logNotification = async (email, message, type) => {
  try {
    const notification = new Notification({ email, message, type });
    await notification.save();
  } catch (err) {
    console.error('Error saving notification:', err);
  }
};

module.exports = { logNotification };
