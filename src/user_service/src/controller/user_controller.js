// src/routes/userRoutes.js
const { Router } = require("express");
const requestLogger = require("../middleware/logs_middle_ware");
const {
  notFoundHandler,
  errorHandler,
} = require("../middleware/error_middle_ware");
const removeMongoId = require("../middleware/app_middle_ware");
const userService = require("../model/user_service.js");
const {
  parseIdMiddleware,
  validateAndParseBirthday,
} = require("../utils/helpers.js");

const userController = Router(); // Create a new userController object
userController.use(requestLogger);
userController.use(removeMongoId);

// Define your routes on the 'userController' instead of 'app'
userController.get("/api/all", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      message: "Users Data",
      users: users,
    });
  } catch (error) {
    console.error(error);
    // Always handle errors in async routes to prevent your server from crashing
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

userController.get("/api/:id", parseIdMiddleware, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      message: `User ${userId} found.`,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

userController.post("/api/add", validateAndParseBirthday, async (req, res) => {
  try {
    // req.body.birthday is ALREADY a Date object here because of the middleware!
    const newUser = await userService.addUser(req.body);

    return res.status(201).json({
      message: `User ${newUser.id} created successfully.`,
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

userController.delete("/api/:id", parseIdMiddleware, async (req, res) => {
  try {
    // req.body.birthday is ALREADY a Date object here because of the middleware!
    const userId = req.params.id;
    await userService.deleteUser(userId);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
userController.use(notFoundHandler);
userController.use(errorHandler);

// Export the userController so server.js can use it
module.exports = userController;
