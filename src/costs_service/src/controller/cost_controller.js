const { Router } = require("express");

const requestLogger = require("../middleware/logs_middle_ware");
const removeMongoId = require("../middleware/app_middle_ware");
const { validateYearAndMonth } = require("../middleware/cost_middle_ware");
const { notFoundHandler, errorHandler } = require("../middleware/error_handlers");

const costService = require("../model/cost_service");
const reportService = require("../model/report_service");

const costController = Router();

/**
 * Global middlewares for this controller
 */
costController.use(requestLogger);
costController.use(removeMongoId);

/**
 * GET /api/all
 * Get all cost items
 */
costController.get("/api/all", async (req, res, next) => {
  try {
    const costs = await costService.getAllCosts();
    res.status(200).json(costs);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/add
 * Add new cost item
 */
costController.post(
  "/api/add",
  validateYearAndMonth("addCost"),
  async (req, res, next) => {
    console.log('test1');
    try {
      const newCost = await costService.addCostItem(req.body);
      res.status(201).json(newCost);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/report
 * Get monthly report
 */
costController.get(
  "/api/report",
  validateYearAndMonth("report"),
  async (req, res, next) => {
    try {
      const report = await reportService.getReport(req.query);
      res.status(200).json(report);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Error handling
 */
costController.use(notFoundHandler);
costController.use(errorHandler);

module.exports = costController;
