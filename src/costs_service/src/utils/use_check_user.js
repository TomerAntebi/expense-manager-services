// utils/userValidation.js
exports.validateUserExists = async (userid) => {
  if (!userid) {
    return false;
  }
  try {
    const response = await fetch(`${process.env.USER_SERVICE_URL}${userid}`);
    return response.ok;
  } catch (err) {
    return false;
  }
};
