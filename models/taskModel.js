const mongoose = require('mongoose');
 
const taskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true },
    assignedTo: { type: String, required: true },
    status: { type: String, required: true },
    area: { type: String, required: true },
   
    description: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Task', taskSchema);