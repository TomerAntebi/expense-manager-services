const costModel = require("./cost_schema");
const { validateUserExists } = require("../utils/validate_user");
const { isPastMonth } = require("../utils/helpers");

const ALL_CATEGORIES = ["food", "health", "housing", "sports", "education"];

/**
 * Get all cost items
 */
exports.getAllCosts = async () => {
  return costModel.find({});
};

/*
 C:
 This function is used for the Users service requirement:
 Getting The Details of a Specific User must include the user's total costs.
 The computation is done here (in the Costs service) and the Users service calls
 it over HTTP to keep services isolated.
*/
exports.getTotalCostsForUser = async (userid) => {
  // ++c Service-layer validation: userid must be an integer (consistent across services).
  if (!Number.isInteger(userid)) {
    const err = new Error("userid must be an integer");
    err.statusCode = 400;
    throw err;
  }

  // ++c Compute total using Mongo aggregation (keeps Users service isolated from DB).
  const totalAggregation = await costModel.aggregate([
    { $match: { userid } },
    { $group: { _id: "$userid", total: { $sum: "$sum" } } },
  ]);

  return totalAggregation.length ? totalAggregation[0].total : 0;
};

/**
 * Add new cost item
 * Business rules enforced here
 */
exports.addCostItem = async (costData) => {
  const { userid, sum, category, date } = costData;
  // ++c Normalize optional date into a Date object (schema default applies when omitted).
  const parsedCostDate = date ? new Date(date) : null;

  // ++c Business rule: userid must be an integer.
  if (!Number.isInteger(userid)) {
    const err = new Error("userid must be an integer");
    err.statusCode = 400;
    throw err;
  }

  // ++c Business rule: description is required and cannot be blank.
  if (typeof costData.description !== "string" || !costData.description.trim()) {
    const err = new Error("description is required");
    err.statusCode = 400;
    throw err;
  }

  // ++c Business rule: sum must be a positive number.
  if (!Number.isFinite(sum) || sum <= 0) {
    const err = new Error("sum must be a positive number");
    err.statusCode = 400;
    throw err;
  }

  // ++c Business rule: category must be one of the allowed categories.
  if (!ALL_CATEGORIES.includes(category)) {
    const err = new Error("Invalid cost category");
    err.statusCode = 400;
    throw err;
  }

  // ++c Optional date validation (if date is provided)
  if (parsedCostDate) {
    // ++c Reject invalid date strings (NaN timestamp).
    if (Number.isNaN(parsedCostDate.getTime())) {
      const err = new Error("Invalid date");
      err.statusCode = 400;
      throw err;
    }

    // Server doesn't allow adding costs with dates belonging to the past.
    // We enforce this at the month granularity to keep reports cacheable.
    // ++c Business rule: cannot add a cost to a past month (computed-report cache consistency).
    if (isPastMonth(parsedCostDate.getFullYear(), parsedCostDate.getMonth() + 1)) {
      const err = new Error("Cannot add cost item to a past month");
      err.statusCode = 400;
      throw err;
    }
  }

  // ++c Verify user exists via Users service (separate process requirement).
  const userExists = await validateUserExists(userid);
  if (!userExists) {
    const err = new Error("User does not exist");
    err.statusCode = 404;
    throw err;
  }

  if (parsedCostDate) {
    return costModel.create({ ...costData, date: parsedCostDate });
  }

  // ++c No date provided -> schema default applies automatically
  return costModel.create(costData);
};

/**
 * Calculate monthly report
 */
exports.calculateReport = async (userid, year, month) => {
  // ++c Compute report boundaries as [startOfMonth, endOfMonth) to match Mongo $gte/$lt.
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  // ++c Aggregate costs for the requested month and group them by category.
  const aggregation = await costModel.aggregate([
    {
      $match: {
        userid,
        date: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        costs: {
          $push: {
            sum: "$sum",
            description: "$description",
            day: { $dayOfMonth: "$date" },
          },
        },
      },
    },
  ]);

  const costs = ALL_CATEGORIES.map((category) => {
    const bucket = aggregation.find((r) => r._id === category);
    return {
      [category]: bucket ? bucket.costs : [],
    };
  });

  return {
    userid,
    year,
    month,
    costs,
  };
};
