const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    catalogItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },
    price: Number,
    leadTimeDays: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['submitted', 'accepted', 'rejected'], default: 'submitted' }
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
