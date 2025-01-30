const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email to identify the user
  message: { type: String, required: true }, // Notification message
  type: { type: String, required: true }, // Type: "project", "organization", etc.
  date: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model('Notification', notificationSchema);
