const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
