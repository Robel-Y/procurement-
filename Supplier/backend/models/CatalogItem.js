const mongoose = require('mongoose');

const catalogItemSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  name: { type: String, required: true },
  sku: String,
  description: String,
  unitPrice: Number,
  uom: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
