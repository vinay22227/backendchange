const express = require('express');
const router = express.Router();
const Payment = require('../models/paymentModel'); // Import the payment model

// Store Payment Details
router.post('/pay', async (req, res) => {
  try {
    const { fullName, email, mobile, address, area, townCity, state, pincode } = req.body;

    // Validate the required fields
    if (!fullName || !email || !mobile || !address || !area || !townCity || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Create a new payment document in MongoDB
    const newPayment = new Payment({
      fullName,
      email,
      mobile,
      address,
      area,
      townCity,
      state,
      pincode,
    });

    // Save payment details to the database
    await newPayment.save();
    res.status(201).json({ success: true, message: 'Payment details saved successfully', data: newPayment });
  } catch (error) {
    console.error('Error saving payment details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get Payment Details by Email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find payment details by email
    const paymentDetails = await Payment.findOne({ email });

    if (!paymentDetails) {
      return res.status(404).json({ success: false, error: 'No payment details found' });
    }

    res.json({ success: true, data: paymentDetails });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get All User Payment Details
router.get('/', async (req, res) => {
  try {
    const allPayments = await Payment.find(); // Fetch all payment details

    if (allPayments.length === 0) {
      return res.status(404).json({ success: false, error: 'No payment details found' });
    }

    res.json({ success: true, data: allPayments });
  } catch (error) {
    console.error('Error fetching all payment details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
