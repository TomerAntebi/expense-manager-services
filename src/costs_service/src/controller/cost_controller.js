const { Router } = require("express");
const requestLogger = require("../middleware/logs_middle_ware");
const {notFoundHandler,errorHandler} = require("../middleware/error_middle_ware");
const removeMongoId = require("../middleware/app_middle_ware");
const { validateYearAndMonth } = require("../middleware/cost_middle_ware");

const costService = require("../model/cost_service");
const reportService = require("../model/report_service");

const costController = Router(); // Create a new Router object
costController.use(requestLogger);
costController.use(removeMongoId);

// controllers/cost.controller.js
costController.get("/api/all", async (req, res) => {
  try {
    const costs = await costService.getAllCosts();

    res.status(200).json(costs);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

costController.post(
  "/api/add",
  validateYearAndMonth("addCost"),
  async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
      }

      const newCost = await costService.addCostItem(req.body);

      res.status(201).json(newCost);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

costController.get(
  "/api/report",
  validateYearAndMonth("report"),
  async (req, res) => {
    try {
      const report = await reportService.getReport(req.query);

      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.status(201).json(report);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);
costController.use(notFoundHandler);
costController.use(errorHandler);

module.exports = costController;
