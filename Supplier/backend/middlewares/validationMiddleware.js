const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['admin', 'user', 'supplier'].includes(role)) {
    errors.push('Invalid role. Must be either "admin" or "user" or "supplier"');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!password || password.trim().length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateSupplier = (req, res, next) => {
  const { name, email, phone, address, category } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Supplier name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateRFQ = (req, res, next) => {
  const { title, description, items, deadline, organizationId } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('RFQ title is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('RFQ description is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('RFQ must have at least one item');
  } else {
    items.forEach((item, index) => {
      if (!item.name || item.name.trim().length === 0) {
        errors.push(`Item ${index + 1}: name is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity must be greater than 0`);
      }
    });
  }

  if (!deadline) {
    errors.push('Deadline is required');
  } else if (new Date(deadline) < new Date()) {
    errors.push('Deadline must be in the future');
  }

  if (!organizationId || organizationId.trim().length === 0) {
    errors.push('Organization ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateBid = (req, res, next) => {
  const { rfqId, supplierId, items, totalPrice, notes } = req.body;
  const errors = [];

  if (!rfqId || rfqId.trim().length === 0) {
    errors.push('RFQ ID is required');
  }

  if (!supplierId || supplierId.trim().length === 0) {
    errors.push('Supplier ID is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Bid must have at least one item');
  } else {
    items.forEach((item, index) => {
      if (!item.itemId || item.itemId.trim().length === 0) {
        errors.push(`Item ${index + 1}: itemId is required`);
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: unitPrice must be a non-negative number`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity must be greater than 0`);
      }
    });
  }

  if (totalPrice === undefined || totalPrice < 0) {
    errors.push('Total price must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateCatalogItem = (req, res, next) => {
  const { name, description, category, price, supplierId } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Item name is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Item description is required');
  }

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (price === undefined || price < 0) {
    errors.push('Price must be a non-negative number');
  }

  if (!supplierId || supplierId.trim().length === 0) {
    errors.push('Supplier ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const mongoIdPattern = /^[a-f\d]{24}$/i;

    if (!id || !mongoIdPattern.test(id)) {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        error: `${paramName} must be a valid MongoDB ObjectId`
      });
    }

    next();
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSupplier,
  validateRFQ,
  validateBid,
  validateCatalogItem,
  validateMongoId
};
