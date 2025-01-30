const mongoose = require('mongoose');
 
const organizationSchema = new mongoose.Schema({
    organizationName: { type: String, required: true },
    organizationDetails: { type: String, required: true },
    contactNo: { type: String, required: true },
    organizationEmail: { type: String, required: true, unique: true },
    paymentMethod: {
        type: String,
        enum: ['Online', 'Card', 'Cash'], // Valid values
        required: true
    },
    userEmail: String, // Field to associate organization with user
    //  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserId', required: true }
});
 
// module.exports = mongoose.model('Organization', organizationSchema);
 
const Organization = mongoose.model('Organization', organizationSchema);
 
module.exports = Organization;