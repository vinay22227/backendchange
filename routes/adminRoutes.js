const express = require('express');
const router = express.Router();
const { 
    getAllOrganizationRequests, 
    approveOrganizationRequest, 
    rejectOrganizationRequest 
} = require('../controllers/adminController');

router.get('/requests', getAllOrganizationRequests); // Fetch all requests
router.put('/approve/:requestId', approveOrganizationRequest); // Approve request
router.put('/reject/:requestId', rejectOrganizationRequest); // Reject request

module.exports = router;
