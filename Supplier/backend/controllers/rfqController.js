const RFQ = require('../models/RFQ');

// Create RFQ
exports.createRFQ = async (req, res) => {
  try {
    const { title, description, items, deadline } = req.body;
    const rfq = await RFQ.create({ title, description, items, deadline });
    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all RFQs
exports.getRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.find().sort({ createdAt: -1 });
    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single RFQ
exports.getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate('items.catalogItemId');
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update RFQ
exports.updateRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete RFQ
exports.deleteRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndDelete(req.params.id);
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
