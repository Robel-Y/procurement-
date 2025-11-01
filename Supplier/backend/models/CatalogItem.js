const mongoose = require('mongoose');

const catalogItemSchema = new mongoose.Schema({
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: [true, 'Supplier ID is required']
  },
  name: { 
    type: String, 
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters'],
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true // Allows multiple null values
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  specifications: {
    type: Map,
    of: String
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  uom: {
    type: String,
    required: [true, 'Unit of measure is required'],
    trim: true
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  leadTimeDays: {
    type: Number,
    default: 0,
    min: [0, 'Lead time cannot be negative']
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'discontinued', 'out_of_stock'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  pricing: {
    bulk: [{
      minQuantity: Number,
      maxQuantity: Number,
      price: Number
    }],
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  warranty: {
    duration: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years']
    },
    terms: String
  },
  compliance: [{
    standard: String,
    certified: Boolean,
    certificateUrl: String
  }],
  views: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
catalogItemSchema.virtual('discountedPrice').get(function() {
  if (this.pricing && this.pricing.discountPercentage > 0) {
    return this.unitPrice * (1 - this.pricing.discountPercentage / 100);
  }
  return this.unitPrice;
});

// Virtual for availability status
catalogItemSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.stockQuantity > 0;
});

// Method to increment views
catalogItemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to update rating
catalogItemSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Method to update stock
catalogItemSchema.methods.updateStock = function(quantity) {
  this.stockQuantity += quantity;
  if (this.stockQuantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock') {
    this.status = 'active';
  }
  return this.save();
};

// Text index for search
catalogItemSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  tags: 'text'
});

// Compound indexes for common queries
catalogItemSchema.index({ supplierId: 1, status: 1 });
catalogItemSchema.index({ category: 1, status: 1 });
catalogItemSchema.index({ unitPrice: 1 });
catalogItemSchema.index({ 'rating.average': -1 });
catalogItemSchema.index({ totalOrders: -1 });
catalogItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
