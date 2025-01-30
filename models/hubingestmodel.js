const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hubIngestSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User
    required: true
  },
  projectName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to Project
    required: true
  },
  // status: {
  //   type: String,
  //   default: 'Not Running'
  // },
  subscriptionType: {
    type: String, // Field to store subscription type
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('HubIngest', hubIngestSchema);
