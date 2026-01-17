const reportModel = require("./report_schema");
const costService = require("./cost_service");
const { validateUserExists } = require("../utils/use_check_user");

const createReport = async (report) => {
  return await reportModel.create(report);
};

exports.getReport = async ({ userid, year, month }) => {
  const exists = await validateUserExists(userid);
  if (!exists) {
    throw new Error("User does not exist");
  }

  const cachedReport = await reportModel.findOne({
    userid,
    year,
    month,
  });

  if (cachedReport) {
    return cachedReport;
  }

  const report = await costService.calculateReport(userid, year, month);

  const now = new Date();
  const isPast =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  if (isPast) {
    await createReport(report);
  }

  return report;
};
