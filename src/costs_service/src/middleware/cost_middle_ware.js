/**
 * Middleware to validate and normalize userid, year and month
 * - Used for both report queries and add cost requests
 * - Converts values to numbers
 * - Throws errors to be handled by global error handler
 */
exports.validateYearAndMonth = (mode = "report") => {
  return (req, res, next) => {
    console.log('test2');
    // Select source based on request type
    // addCost -> body, report -> query
    const source = mode === "addCost" ? req.body : req.query;

    // Normalize input values
    const userid = Number(source.userid);
    const year = Number(source.year);
    const month = Number(source.month);

    // Basic validations
    validateUserId(userid);
    validateYear(year);
    validateMonth(month);

    // Business rule for adding costs only
    if (mode === "addCost") {
      validateNotPastMonth(year, month);
    }

    // Overwrite original values with validated numbers
    source.userid = userid;
    source.year = year;
    source.month = month;

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

/**
 * Prevent adding cost items to a past month
 */
const validateNotPastMonth = (year, month) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    const err = new Error("Cannot add cost item to a past month");
    err.statusCode = 400;
    throw err;
  }
};
