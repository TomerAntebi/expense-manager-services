const costModel = require("./cost_schema");
const { validateUserExists } = require("../utils/validate_user");

const ALL_CATEGORIES = ["food", "health", "housing", "sports", "education"];

/**
 * Get all cost items
 */
exports.getAllCosts = async () => {
  return costModel.find({});
};

/**
 * Add new cost item
 * Business rules enforced here
 */
exports.addCostItem = async (costData) => {
  const { userid, sum, category } = costData;

  if (!Number.isFinite(sum) || sum <= 0) {
    const err = new Error("sum must be a positive number");
    err.statusCode = 400;
    throw err;
  }

  if (!ALL_CATEGORIES.includes(category)) {
    const err = new Error("Invalid cost category");
    err.statusCode = 400;
    throw err;
  }

  const userExists = await validateUserExists(userid);
  if (!userExists) {
    const err = new Error("User does not exist");
    err.statusCode = 404;
    throw err;
  }

  return costModel.create(costData);
};

/**
 * Calculate monthly report
 */
exports.calculateReport = async (userid, year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  const aggregation = await costModel.aggregate([
    {
      $match: {
        userid,
        createdAt: {
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
            day: { $dayOfMonth: "$createdAt" },
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
