const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  rfqId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RFQ', 
    required: [true, 'RFQ ID is required']
  },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: [true, 'Supplier ID is required']
  },
  items: [{
    rfqItemId: String,
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    catalogItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'CatalogItem'
    },
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
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    leadTimeDays: {
      type: Number,
      default: 0,
      min: [0, 'Lead time cannot be negative']
    },
    specifications: {
      type: Map,
      of: String
    },
    notes: String
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    }
  },
  deliveryTerms: {
    estimatedDeliveryDate: Date,
    deliveryLocation: String,
    shippingMethod: String,
    incoterms: String
  },
  paymentTerms: {
    method: String,
    terms: String,
    advancePaymentPercentage: {
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
  technicalCompliance: {
    meetsRequirements: {
      type: Boolean,
      default: true
    },
    deviations: String,
    certifications: [String]
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: {
      values: ['draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      message: '{VALUE} is not a valid status'
    },
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluationScore: {
    technical: Number,
    commercial: Number,
    delivery: Number,
    overall: Number
  },
  evaluationNotes: String,
  rejectionReason: String,
  isWinner: {
    type: Boolean,
    default: false
  },
  rank: Number,
  validUntil: Date,
  notes: String,
  internalNotes: String,
  revisionNumber: {
    type: Number,
    default: 1
  },
  previousBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  submittedBy: {
    name: String,
    email: String,
    position: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate bid number
bidSchema.pre('save', async function(next) {
  if (!this.bidNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.bidNumber = `BID-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate pricing if not set
  if (this.items && this.items.length > 0) {
    const subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (!this.pricing.subtotal) {
      this.pricing.subtotal = subtotal;
    }
    if (!this.pricing.totalAmount) {
      this.pricing.totalAmount = subtotal + 
        (this.pricing.tax || 0) + 
        (this.pricing.shipping || 0) - 
        (this.pricing.discount || 0);
    }
  }
  
  next();
});

// Virtual for average lead time
bidSchema.virtual('averageLeadTime').get(function() {
  if (!this.items || this.items.length === 0) return 0;
  const total = this.items.reduce((sum, item) => sum + (item.leadTimeDays || 0), 0);
  return Math.ceil(total / this.items.length);
});

// Virtual for is valid
bidSchema.virtual('isValid').get(function() {
  if (!this.validUntil) return true;
  return this.validUntil > new Date();
});

// Virtual for days until expiry
bidSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validUntil) return null;
  const now = new Date();
  const diff = this.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to submit bid
bidSchema.methods.submit = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

// Method to accept bid
bidSchema.methods.accept = function(userId) {
  this.status = 'accepted';
  this.isWinner = true;
  this.reviewedAt = new Date();
  this.reviewedBy = userId;
  return this.save();
};

// Method to reject bid
bidSchema.methods.reject = function(reason, userId) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.reviewedAt = new Date();
  this.reviewedBy = userId;
  return this.save();
};

// Method to shortlist bid
bidSchema.methods.shortlist = function() {
  this.status = 'shortlisted';
  return this.save();
};

// Method to withdraw bid
bidSchema.methods.withdraw = function() {
  this.status = 'withdrawn';
  return this.save();
};

// Method to create revision
bidSchema.methods.createRevision = function(updates) {
  const Bid = this.constructor;
  const revision = new Bid({
    ...this.toObject(),
    _id: undefined,
    bidNumber: undefined,
    revisionNumber: this.revisionNumber + 1,
    previousBidId: this._id,
    status: 'draft',
    submittedAt: undefined,
    ...updates
  });
  return revision.save();
};

// Indexes for performance
bidSchema.index({ bidNumber: 1 });
bidSchema.index({ rfqId: 1, supplierId: 1 });
bidSchema.index({ rfqId: 1, status: 1 });
bidSchema.index({ supplierId: 1, status: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ submittedAt: -1 });
bidSchema.index({ isWinner: 1 });
bidSchema.index({ 'pricing.totalAmount': 1 });
bidSchema.index({ 'evaluationScore.overall': -1 });
bidSchema.index({ rank: 1 });

// Compound index for unique bid per RFQ per supplier (only one active bid)
bidSchema.index(
  { rfqId: 1, supplierId: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['submitted', 'under_review', 'shortlisted'] } 
    }
  }
);

module.exports = mongoose.model('Bid', bidSchema);
