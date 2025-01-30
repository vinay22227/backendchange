const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Merchant Configuration
const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";
const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const REDIRECT_URL = "http://localhost:3000/api/payment/status";
const SUCCESS_URL = "http://localhost:3001/subscriptions";
const FAILURE_URL = "http://localhost:3001/payment-failure";

// Route to create an order
router.post('/create-order', async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  const orderId = uuidv4(); // Unique transaction ID

  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100, // Amount in paise
    merchantTransactionId: orderId,
    redirectUrl: `${REDIRECT_URL}/?id=${orderId}`,
    redirectMode: 'POST',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
  const keyIndex = 1;
  const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  const options = {
    method: 'POST',
    url: MERCHANT_BASE_URL,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    data: {
      request: payload,
    },
  };

  try {
    const response = await axios.request(options);
    console.log("Payment URL:", response.data.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({ msg: "OK", url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Route to check payment status
router.post('/status', async (req, res) => {
  const merchantTransactionId = req.query.id;

  const keyIndex = 1;
  const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  const options = {
    method: 'GET',
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.success === true) {
      return res.redirect(SUCCESS_URL);
    } else {
      return res.redirect(FAILURE_URL);
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router;
