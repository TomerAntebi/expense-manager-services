/*
 C:
 Users service business logic.
 Handles CRUD operations on users and prepares the response for:
 GET /api/users/:id including the computed total costs (fetched from Costs service).
*/
const userModel = require("./user_schema");
const { getTotalCostsForUser } = require("../utils/costs_client");

exports.getAllUsers = async () => {
  // ++c Return all users documents
  return await userModel.find({});
};

exports.getUser = async (userId) => {
  // ++c Internal helper used by other services (or future extensions)
  return await userModel.findOne({ id: userId }); 
};

exports.getUserDetails = async (userId) => {
  // ++c Find user by the required `id` field (not MongoDB _id)
  const user = await userModel.findOne({ id: userId });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // ++c The total computation is done in the Costs service (separate process).
  const total = await getTotalCostsForUser(userId);

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    id: user.id,
    total,
  };
};

exports.addUser = async (userData) => {
  const { id, first_name, last_name, birthday } = userData;

  // ++c Validation required by project
  if (!Number.isInteger(id)) {
    const err = new Error("id must be an integer");
    err.statusCode = 400;
    throw err;
  }

  if (typeof first_name !== "string" || !first_name.trim()) {
    const err = new Error("first_name is required");
    err.statusCode = 400;
    throw err;
  }

  if (typeof last_name !== "string" || !last_name.trim()) {
    const err = new Error("last_name is required");
    err.statusCode = 400;
    throw err;
  }

  if (!(birthday instanceof Date) || Number.isNaN(birthday.getTime())) {
    const err = new Error("birthday must be a valid date");
    err.statusCode = 400;
    throw err;
  }

  return await userModel.create(userData);
};

exports.deleteUser = async (userId) => {
  // ++c Delete user by the required `id` field
  return await userModel.deleteOne({ id: userId });
};
