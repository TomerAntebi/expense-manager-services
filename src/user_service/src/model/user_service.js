const userModel = require("./user_schema");

exports.getAllUsers = async () => {
  return await userModel.find({});
};

exports.getUser = async (userId) => {
  return await userModel.findOne({ id: userId });
};

exports.addUser = async (userData) => {
  return await userModel.create(userData);
};

exports.deleteUser = async (userId) => {
  return await userModel.deleteOne({ id: userId });
};
