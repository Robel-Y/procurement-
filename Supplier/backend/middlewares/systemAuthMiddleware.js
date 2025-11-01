const systemAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required for system access' });
  }

  // Verify API key matches the organization system's key
  // In production, you should store multiple API keys in database with organization IDs
  if (apiKey !== process.env.ORGANIZATION_API_KEY) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  // Optionally extract organization ID from header for future use
  req.organizationId = req.headers['x-organization-id'];
  
  next();
};

module.exports = { systemAuth };
