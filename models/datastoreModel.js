const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataStoreSchema = new Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
    default: 'Data Store' // Default value for serviceType
  },
  projectName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to Project
    required: true
  },
  subscription: {
    type: String, // Subscription type (similar to HubIngest)
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('DataStore', dataStoreSchema);
