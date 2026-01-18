const { Router } = require("express");

const requestLogger = require("../middleware/logs_middle_ware");
const { notFoundHandler, errorHandler } = require("../middleware/error_handlers");

const userService = require("../models/user_service");
const {
  parseIdMiddleware,
  validateAndParseBirthday,
} = require("../utils/helpers");

const userController = Router();

/**
 * Global middlewares
 */
userController.use(requestLogger);

/**
 * GET /api/users
 */
userController.get("/api/users", async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id
 */
userController.get("/api/users/:id", parseIdMiddleware, async (req, res, next) => {
  try {
    const user = await userService.getUserDetails(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/add
 */
userController.post(
  "/api/add",
  validateAndParseBirthday,
  async (req, res, next) => {
    try {
      const newUser = await userService.addUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/:id
 */
userController.delete("/api/:id", parseIdMiddleware, async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * Error handlers
 */
userController.use(notFoundHandler);
userController.use(errorHandler);

module.exports = userController;
