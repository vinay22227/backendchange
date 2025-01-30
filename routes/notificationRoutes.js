const express = require('express');
const router = express.Router();
const Notification = require('../models/notificationModels');

// Get all notifications for a specific email
router.get('/:email', async (req, res) => {
  try {
    const notifications = await Notification.find({ email: req.params.email }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  const { email, message, type } = req.body;

  try {
    const notification = new Notification({ email, message, type });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
