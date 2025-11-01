// Pagination middleware

const paginate = (req, res, next) => {
  // Get page and limit from query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Validate page and limit
  if (page < 1) {
    return res.status(400).json({
      message: 'Invalid page number',
      error: 'Page number must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      message: 'Invalid limit',
      error: 'Limit must be between 1 and 100'
    });
  }

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Attach pagination data to request
  req.pagination = {
    page,
    limit,
    skip
  };

  next();
};

// Helper function to create pagination response
const createPaginationResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

// Middleware to add pagination helper to response
const addPaginationHelper = (req, res, next) => {
  res.paginate = (data, totalCount) => {
    const { page, limit } = req.pagination || { page: 1, limit: 10 };
    return createPaginationResponse(data, totalCount, page, limit);
  };

  next();
};

// Advanced pagination with sorting and filtering
const advancedPaginate = (req, res, next) => {
  // Get pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Get sorting parameters
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  
  // Get search parameter
  const search = req.query.search || '';

  // Validate
  if (page < 1) {
    return res.status(400).json({
      message: 'Invalid page number',
      error: 'Page number must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      message: 'Invalid limit',
      error: 'Limit must be between 1 and 100'
    });
  }

  // Calculate skip
  const skip = (page - 1) * limit;

  // Attach to request
  req.pagination = {
    page,
    limit,
    skip,
    sort: { [sortBy]: sortOrder },
    search
  };

  // Add helper function
  res.paginate = (data, totalCount) => {
    return createPaginationResponse(data, totalCount, page, limit);
  };

  next();
};

// Cursor-based pagination (for real-time data)
const cursorPaginate = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor || null;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      message: 'Invalid limit',
      error: 'Limit must be between 1 and 100'
    });
  }

  req.cursorPagination = {
    limit,
    cursor,
    sort: { [sortBy]: sortOrder },
    sortBy
  };

  // Helper to create cursor response
  res.cursorPaginate = (data) => {
    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore && items.length > 0 
      ? items[items.length - 1][sortBy] 
      : null;

    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore,
        limit
      }
    };
  };

  next();
};

module.exports = {
  paginate,
  addPaginationHelper,
  advancedPaginate,
  cursorPaginate,
  createPaginationResponse
};
