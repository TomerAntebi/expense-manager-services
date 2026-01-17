// src/routes/userRoutes.js
const { Router } = require("express");
const requestLogger = require("../middleware/logs_middle_ware");
const {
  notFoundHandler,
  errorHandler,
} = require("../middleware/error_handlers.js");

const adminService = require("../model/admin_service");

const adminController = Router(); // Create a new adminController object
adminController.use(requestLogger);

// Define your routes on the 'adminController' instead of 'app'
adminController.get("/api/about", (req, res) => {
  console.log("controller");
  const students = adminService.getStudents();
  res.status(201).json(students);
});

adminController.use(notFoundHandler);
adminController.use(errorHandler);

// Export the adminController so server.js can use it
module.exports = adminController;
