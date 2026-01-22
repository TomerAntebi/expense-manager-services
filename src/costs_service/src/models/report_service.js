const reportModel = require("./report_schema");
const costService = require("./cost_service");
const { validateUserExists } = require("../utils/validate_user");
const { isPastMonth } = require("../utils/helpers");

/**
 * Get monthly report
 * Uses cache if exists
 * Persists report only for past months
 */
exports.getReport = async ({ userid, year, month }) => {
  // ++c Validate report parameters in the service layer (defense-in-depth).
  // Prevents creating invalid cached reports (e.g., year values like 0 / 202 / -1).
  if (year < 1900) {
    const err = new Error("Year must be >= 1900");
    err.statusCode = 400;
    throw err;
  }

  // ++c Business rule: report is only valid for existing users (verified via Users service).
  const userExists = await validateUserExists(userid);
  if (!userExists) {
    const err = new Error("User does not exist");
    err.statusCode = 404;
    throw err;
  }

  // ++c Use cached report if already computed for (userid, year, month).
  const cachedReport = await reportModel.findOne({ userid, year, month });
  if (cachedReport) {
    return cachedReport;
  }

  // ++c Compute report from costs collection (grouped by category).
  const report = await costService.calculateReport(userid, year, month);

  // ++c Requirement: Computed Design Pattern - cache past-month reports
  if (isPastMonth(year, month)) {
    await reportModel.create(report);
  }

  return report;
};
