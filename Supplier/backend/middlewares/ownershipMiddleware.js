const Supplier = require('../models/Supplier');
const Bid = require('../models/Bid');
const CatalogItem = require('../models/CatalogItem');

// Verify supplier ownership
const verifySupplierOwnership = async (req, res, next) => {
  try {
    const supplierId = req.params.id || req.params.supplierId;
    
    if (!supplierId) {
      return res.status(400).json({ 
        message: 'Supplier ID is required' 
      });
    }

    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ 
        message: 'Supplier not found' 
      });
    }

    // Admin can access any supplier
    if (req.user && req.user.role === 'admin') {
      req.supplier = supplier;
      return next();
    }

    // Check if user owns this supplier (you may need to add userId field to Supplier model)
    // For now, we'll allow if user is authenticated
    if (req.user) {
      req.supplier = supplier;
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You do not have permission to access this supplier'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error verifying supplier ownership',
      error: error.message 
    });
  }
};

// Verify bid ownership
const verifyBidOwnership = async (req, res, next) => {
  try {
    const bidId = req.params.id || req.params.bidId;
    
    if (!bidId) {
      return res.status(400).json({ 
        message: 'Bid ID is required' 
      });
    }

    const bid = await Bid.findById(bidId).populate('supplierId');
    
    if (!bid) {
      return res.status(404).json({ 
        message: 'Bid not found' 
      });
    }

    // Admin can access any bid
    if (req.user && req.user.role === 'admin') {
      req.bid = bid;
      return next();
    }

    // Check if user owns the supplier associated with this bid
    // For now, we'll allow if user is authenticated
    if (req.user) {
      req.bid = bid;
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You do not have permission to access this bid'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error verifying bid ownership',
      error: error.message 
    });
  }
};

// Verify catalog item ownership
const verifyCatalogItemOwnership = async (req, res, next) => {
  try {
    const itemId = req.params.id || req.params.itemId;
    
    if (!itemId) {
      return res.status(400).json({ 
        message: 'Catalog item ID is required' 
      });
    }

    const catalogItem = await CatalogItem.findById(itemId).populate('supplierId');
    
    if (!catalogItem) {
      return res.status(404).json({ 
        message: 'Catalog item not found' 
      });
    }

    // Admin can access any catalog item
    if (req.user && req.user.role === 'admin') {
      req.catalogItem = catalogItem;
      return next();
    }

    // Check if user owns the supplier associated with this catalog item
    // For now, we'll allow if user is authenticated
    if (req.user) {
      req.catalogItem = catalogItem;
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You do not have permission to access this catalog item'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error verifying catalog item ownership',
      error: error.message 
    });
  }
};

// Verify supplier ID in request body matches authenticated user's supplier
const verifySupplierInBody = async (req, res, next) => {
  try {
    const supplierId = req.body.supplierId;
    
    if (!supplierId) {
      return res.status(400).json({ 
        message: 'Supplier ID is required in request body' 
      });
    }

    // Admin can create for any supplier
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // For regular users, you would check if they own this supplier
    // This requires adding a userId field to the Supplier model
    // For now, we'll allow if user is authenticated
    if (req.user) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You do not have permission to create resources for this supplier'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error verifying supplier',
      error: error.message 
    });
  }
};

// Check if supplier is active
const requireActiveSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.supplierId || req.body.supplierId;
    
    if (!supplierId) {
      return res.status(400).json({ 
        message: 'Supplier ID is required' 
      });
    }

    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ 
        message: 'Supplier not found' 
      });
    }

    if (supplier.status !== 'active') {
      return res.status(403).json({ 
        message: 'Access denied',
        error: `Supplier status is ${supplier.status}. Only active suppliers can perform this action.`
      });
    }

    req.supplier = supplier;
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking supplier status',
      error: error.message 
    });
  }
};

module.exports = {
  verifySupplierOwnership,
  verifyBidOwnership,
  verifyCatalogItemOwnership,
  verifySupplierInBody,
  requireActiveSupplier
};
