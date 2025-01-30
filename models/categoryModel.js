const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }, // Automatically sets the creation date
  updatedAt: { type: Date, default: Date.now }, // Automatically sets the updated date
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now(); // Update the updatedAt field whenever the category is updated
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
