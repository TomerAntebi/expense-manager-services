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
  const userExists = await validateUserExists(userid);
  if (!userExists) {
    const err = new Error("User does not exist");
    err.statusCode = 404;
    throw err;
  }

  const cachedReport = await reportModel.findOne({ userid, year, month });
  if (cachedReport) {
    return cachedReport;
  }

  const report = await costService.calculateReport(userid, year, month);

  if (isPastMonth(year, month)) {
    await reportModel.create(report);
  }

  return report;
};
