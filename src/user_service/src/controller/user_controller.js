const { Router } = require("express");

const requestLogger = require("../middleware/logs_middle_ware");
const removeMongoId = require("../middleware/app_middle_ware");
const { notFoundHandler, errorHandler } = require("../middleware/error_handlers");

const userService = require("../model/user_service");
const {
  parseIdMiddleware,
  validateAndParseBirthday,
} = require("../utils/helpers");

const userController = Router();

/**
 * Global middlewares
 */
userController.use(requestLogger);
userController.use(removeMongoId);

/**
 * GET /api/all
 */
userController.get("/api/all", async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

/**
 * GET /api/:id
 */
userController.get("/api/:id", parseIdMiddleware, async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.status(200).json(user);
});

/**
 * POST /api/add
 */
userController.post(
  "/api/add",
  validateAndParseBirthday,
  async (req, res) => {
    const newUser = await userService.addUser(req.body);
    res.status(201).json(newUser);
  }
);

/**
 * DELETE /api/:id
 */
userController.delete("/api/:id", parseIdMiddleware, async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

/**
 * Error handlers
 */
userController.use(notFoundHandler);
userController.use(errorHandler);

module.exports = userController;
