const mongoose = require('mongoose');
 
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionType: { type: String, required: true, 
  enum: ['FreeTrial', 'Organization'] },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
}, { timestamps: true });
 
module.exports = mongoose.model('Subscription', SubscriptionSchema);