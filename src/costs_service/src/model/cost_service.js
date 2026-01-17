const { validateUserExists } = require("../utils/use_check_user");
const costModel = require("./cost_schema");

const ALL_CATEGORIES = ["food", "health", "housing", "sports", "education"];

// services/cost.service.js
exports.getAllCosts = async () => {
  return await costModel.find({});
};

exports.addCostItem = async (newCostData) => {
  const { year, month } = [newCostData.year, newCostData.month];
  // 1. Call the Users Service
  const exists = await validateUserExists(newCostData.userid);

  if (!exists) {
    throw new Error("User does not exist");
  }
  // 4. Create the cost item
  newCostItem = (await costModel.create(newCostData)).toObject();
  delete newCostItem._id;
  return newCostItem;
};

exports.calculateReport = async (userid, year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 1);

  const aggregationResult = await costModel.aggregate([
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
    const found = aggregationResult.find((r) => r._id === category);
    return {
      [category]: found ? found.costs : [],
    };
  });

  return {
    userid,
    year,
    month,
    costs,
  };
};
