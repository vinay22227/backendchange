const mongoose = require('mongoose');

const createServiceSchema = new mongoose.Schema({
    serviceName: { type: String, required: true },
    subscriptionName: { type: String, required: true }, // e.g., "Free Trial" or "Organization"
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

module.exports = mongoose.model('CreateService', createServiceSchema);