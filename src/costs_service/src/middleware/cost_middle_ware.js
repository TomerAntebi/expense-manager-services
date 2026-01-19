/**
 * Middleware to validate and normalize userid, year and month
 * - Used for both report queries and add cost requests
 * - Converts values to numbers
 * - Throws errors to be handled by global error handler
 */
exports.validateYearAndMonth = (mode = "report") => {
  return (req, res, next) => {
    // Select source based on request type
    // addCost -> body, report -> query
    const source = mode === "addCost" ? req.body : req.query;

    // Normalize input values
    const userIdInput = source.id !== undefined ? source.id : source.userid;
    const userid = Number(userIdInput);
    const year = Number(source.year);
    const month = Number(source.month);

    // Basic validations
    validateUserId(userid);
    validateYear(year);
    validateMonth(month);

    // Overwrite original values with validated numbers
    source.userid = userid;
    source.year = year;
    source.month = month;
    if (source.id !== undefined) {
      delete source.id;
    }

    // Continue to controller
    next();
  };
};

/**
 * Validate user id
 */
const validateUserId = (userid) => {
  if (Number.isNaN(userid)) {
    const err = new Error("User id must be a number");
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Validate year
 */
const validateYear = (year) => {
  if (!Number.isInteger(year)) {
    const err = new Error("Year must be an integer");
    err.statusCode = 400;
    throw err;
  }

  if (year < 1900) {
    const err = new Error("Year must be >= 1900");
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Validate month (1-12)
 */
const validateMonth = (month) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    const err = new Error("Month must be an integer between 1 and 12");
    err.statusCode = 400;
    throw err;
  }
};

// ++c Note: adding costs is validated in the cost service itself. This middleware
// is used to validate report queries only.
