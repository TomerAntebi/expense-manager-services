const students = require("./about_data");

exports.getStudents = () => {
  if (!students) {
    const error = new Error("Students data not found");
    error.statusCode = 404;
    throw error;
  }
  return students;
};
