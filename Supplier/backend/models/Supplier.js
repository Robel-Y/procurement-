const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
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
  businessDetails: {
    registrationNumber: String,
    taxId: String,
    website: String,
    yearEstablished: Number,
    numberOfEmployees: Number
  },
  categories: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    swiftCode: String,
    iban: String
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'active', 'suspended', 'rejected', 'inactive'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending' 
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
  performanceMetrics: {
    totalBids: { type: Number, default: 0 },
    wonBids: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    onTimeDeliveryRate: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 }
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedReason: String,
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for win rate
supplierSchema.virtual('winRate').get(function() {
  if (this.performanceMetrics.totalBids === 0) return 0;
  return ((this.performanceMetrics.wonBids / this.performanceMetrics.totalBids) * 100).toFixed(2);
});

// Method to update last activity
supplierSchema.methods.updateActivity = function() {
  this.lastActivityAt = Date.now();
  return this.save();
};

// Method to calculate and update rating
supplierSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Indexes for performance
supplierSchema.index({ email: 1 });
supplierSchema.index({ companyName: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ 'rating.average': -1 });
supplierSchema.index({ createdAt: -1 });
supplierSchema.index({ lastActivityAt: -1 });

module.exports = mongoose.model('Supplier', supplierSchema);
