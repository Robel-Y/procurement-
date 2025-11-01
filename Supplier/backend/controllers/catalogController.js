const CatalogItem = require('../models/CatalogItem');

// Create catalog item
exports.createCatalogItem = async (req, res) => {
  try {
    const { supplierId, name, sku, description, unitPrice, uom } = req.body;

    const item = await CatalogItem.create({
      supplierId,
      name,
      sku,
      description,
      unitPrice,
      uom
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all catalog items
exports.getCatalogItems = async (req, res) => {
  try {
    const items = await CatalogItem.find().populate('supplierId', 'companyName email');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single catalog item
exports.getCatalogItemById = async (req, res) => {
  try {
    const item = await CatalogItem.findById(req.params.id).populate('supplierId', 'companyName');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update catalog item
exports.updateCatalogItem = async (req, res) => {
  try {
    const item = await CatalogItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete catalog item
exports.deleteCatalogItem = async (req, res) => {
  try {
    const item = await CatalogItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
