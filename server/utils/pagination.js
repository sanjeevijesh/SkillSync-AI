/**
 * Pagination utility for handling large datasets
 * Supports cursor-based and offset-based pagination
 */

class PaginationHelper {
  /**
   * Offset-based pagination (traditional page numbers)
   * @param {Object} query - Mongoose query object
   * @param {Number} page - Page number (1-indexed)
   * @param {Number} limit - Items per page
   * @param {Object} options - Additional options (sort, select)
   */
  static async offsetPaginate(query, page = 1, limit = 10, options = {}) {
    const {
      sort = { createdAt: -1 },
      select = '',
      populate = null
    } = options;

    // Validate inputs
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (validPage - 1) * validLimit;

    // Execute queries in parallel
    const [items, totalItems] = await Promise.all([
      query
        .sort(sort)
        .skip(skip)
        .limit(validLimit)
        .select(select)
        .populate(populate || '')
        .lean(),
      query.model.countDocuments(query.getQuery())
    ]);

    const totalPages = Math.ceil(totalItems / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    return {
      items,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? validPage + 1 : null,
        prevPage: hasPrevPage ? validPage - 1 : null
      }
    };
  }

  /**
   * Cursor-based pagination (more efficient for large datasets)
   * @param {Object} query - Mongoose query object
   * @param {String} cursor - Cursor for next page
   * @param {Number} limit - Items per page
   * @param {Object} options - Additional options
   */
  static async cursorPaginate(query, cursor = null, limit = 10, options = {}) {
    const {
      sortField = 'createdAt',
      sortOrder = -1,
      select = '',
      populate = null
    } = options;

    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Build query with cursor
    if (cursor) {
      try {
        const decodedCursor = JSON.parse(
          Buffer.from(cursor, 'base64').toString('utf-8')
        );
        
        if (sortOrder === -1) {
          query = query.where(sortField).lt(decodedCursor.value);
        } else {
          query = query.where(sortField).gt(decodedCursor.value);
        }
      } catch (error) {
        // Invalid cursor, ignore it
        console.error('Invalid cursor:', error.message);
      }
    }

    // Fetch items + 1 to check if there's a next page
    const items = await query
      .sort({ [sortField]: sortOrder })
      .limit(validLimit + 1)
      .select(select)
      .populate(populate || '')
      .lean();

    const hasNextPage = items.length > validLimit;
    const resultItems = hasNextPage ? items.slice(0, validLimit) : items;

    // Generate next cursor
    let nextCursor = null;
    if (hasNextPage && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      const cursorData = {
        value: lastItem[sortField],
        id: lastItem._id
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    return {
      items: resultItems,
      pagination: {
        hasNextPage,
        nextCursor,
        itemsPerPage: validLimit,
        itemsReturned: resultItems.length
      }
    };
  }

  /**
   * Generate pagination metadata for response
   */
  static generateMetadata(page, limit, totalItems) {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };
  }

  /**
   * Parse pagination parameters from request
   */
  static parsePaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      sort: { [sort]: order }
    };
  }

  /**
   * Build filter query from request parameters
   */
  static buildFilterQuery(req, allowedFilters = []) {
    const filters = {};

    allowedFilters.forEach(filter => {
      if (req.query[filter]) {
        // Handle different filter types
        if (filter.includes('Min') || filter.includes('Max')) {
          // Range filters
          const field = filter.replace('Min', '').replace('Max', '');
          if (filter.includes('Min')) {
            filters[field] = { ...filters[field], $gte: req.query[filter] };
          } else {
            filters[field] = { ...filters[field], $lte: req.query[filter] };
          }
        } else if (Array.isArray(req.query[filter])) {
          // Array filters (e.g., skills)
          filters[filter] = { $in: req.query[filter] };
        } else if (typeof req.query[filter] === 'string') {
          // Text search
          filters[filter] = new RegExp(req.query[filter], 'i');
        } else {
          // Exact match
          filters[filter] = req.query[filter];
        }
      }
    });

    return filters;
  }
}

// Middleware to add pagination to Express response
function paginationMiddleware(req, res, next) {
  res.paginate = async (query, options = {}) => {
    const { page, limit, sort } = PaginationHelper.parsePaginationParams(req);
    const result = await PaginationHelper.offsetPaginate(query, page, limit, {
      ...options,
      sort
    });
    
    return res.json(result);
  };
  
  next();
}

module.exports = {
  PaginationHelper,
  paginationMiddleware
};