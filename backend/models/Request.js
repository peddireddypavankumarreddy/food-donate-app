const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  food: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fulfilled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
