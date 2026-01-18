/*
 C:
 Admin/About service business logic.
 Provides developers team details (not stored in database).
*/
const students = require("./about_data");

exports.getStudents = () => {
  // ++c Defensive check - should always exist because data is bundled with code
  if (!students) {
    const error = new Error("Students data not found");
    error.statusCode = 404;
    throw error;
  }
  return students;
};
