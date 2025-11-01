const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  items: [{
    catalogItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },
    quantity: Number,
    uom: String
  }],
  status: { type: String, enum: ['open', 'closed', 'awarded'], default: 'open' },
  deadline: Date
}, { timestamps: true });

module.exports = mongoose.model('RFQ', rfqSchema);
