const mongoose = require('mongoose');
 
const deploymentSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    projectCategory: { type: String, required: true },
    description: {
      type: String,
      maxlength: 500,
      validate: {
        validator: function (value) {
          return !value || value.trim().split(' ').length <= 500;
        },
        message: 'Description cannot exceed 500 words.',
      },
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Deployment', deploymentSchema);
 