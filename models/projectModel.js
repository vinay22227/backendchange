const mongoose = require('mongoose');
 
const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  // subscriptionName: {
  //   type: String,
  //   required: true,
  // },
  subscriptionType: {
    type: String, // Ensure this matches the user's subscription type
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});
 
module.exports = mongoose.model('Project', projectSchema);