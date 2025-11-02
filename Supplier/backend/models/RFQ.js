const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  organizationId: {
    type: String,
    required: [true, 'Organization ID is required']
  },
  title: { 
    type: String, 
    required: [true, 'RFQ title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    trim: true
  },
  items: [{
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    uom: {
      type: String,
      required: true,
      trim: true
    },
    specifications: {
      type: Map,
      of: String
    },
    estimatedPrice: Number,
    catalogItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CatalogItem'
    },
    deliveryDate: Date
  }],
  requirements: {
    technicalSpecs: String,
    qualityStandards: String,
    certifications: [String],
    deliveryTerms: String,
    paymentTerms: String,
    warranty: String
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'ETB',
      uppercase: true
    }
  },
  deliveryLocation: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    position: String
  },
  status: { 
    type: String, 
    enum: {
      values: ['draft', 'open', 'closed', 'awarded', 'cancelled', 'expired'],
      message: '{VALUE} is not a valid status'
    },
    default: 'open'
  },
  publishedAt: Date,
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  expectedDeliveryDate: Date,
  invitedSuppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  evaluationCriteria: [{
    criterion: String,
    weight: {
      type: Number,
      min: 0,
      max: 100
    },
    description: String
  }],
  bidCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  awardedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  awardedAt: Date,
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  notes: String,
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate RFQ number
rfqSchema.pre('save', async function(next) {
  if (!this.rfqNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.rfqNumber = `RFQ-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for days until deadline
rfqSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadline) return null;
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
rfqSchema.virtual('isExpired').get(function() {
  return this.deadline && this.deadline < new Date();
});

// Virtual for is active
rfqSchema.virtual('isActive').get(function() {
  return this.status === 'open' && !this.isExpired;
});

// Virtual for total estimated value
rfqSchema.virtual('totalEstimatedValue').get(function() {
  return this.items.reduce((sum, item) => {
    return sum + (item.estimatedPrice || 0) * item.quantity;
  }, 0);
});

// Method to increment view count
rfqSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment bid count
rfqSchema.methods.incrementBidCount = function() {
  this.bidCount += 1;
  return this.save();
};

// Method to check if supplier is invited
rfqSchema.methods.isSupplierInvited = function(supplierId) {
  if (this.isPublic) return true;
  return this.invitedSuppliers.some(id => id.toString() === supplierId.toString());
};

// Method to award bid
rfqSchema.methods.awardBid = function(bidId, userId) {
  this.status = 'awarded';
  this.awardedBid = bidId;
  this.awardedAt = new Date();
  this.awardedBy = userId;
  return this.save();
};

// Method to close RFQ
rfqSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

// Method to cancel RFQ
rfqSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  return this.save();
};

// Indexes for performance
rfqSchema.index({ rfqNumber: 1 });
rfqSchema.index({ organizationId: 1, status: 1 });
rfqSchema.index({ status: 1, deadline: 1 });
rfqSchema.index({ category: 1 });
rfqSchema.index({ publishedAt: -1 });
rfqSchema.index({ deadline: 1 });
rfqSchema.index({ createdAt: -1 });
rfqSchema.index({ 'invitedSuppliers': 1 });

// Text index for search
rfqSchema.index({ 
  title: 'text', 
  description: 'text',
  category: 'text'
});

module.exports = mongoose.model('RFQ', rfqSchema);
