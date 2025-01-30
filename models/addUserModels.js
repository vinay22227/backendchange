const mongoose = require('mongoose');

const AddUserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userAdminName: { type: String, required: true },
  userType: { 
    type: String, 
    required: true, 
    enum: ['Admin', 'Editor', 'Viewer'] 
  },
  companyName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AddUser', AddUserSchema);