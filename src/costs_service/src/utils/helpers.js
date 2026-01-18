// utils/dateParser.js

/**
 * Parse date string in DD/MM/YYYY format
 */
const parseDDMMYYYY = (value) => {
  if (typeof value !== "string") return null;

  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);

  // Prevent invalid dates like 31/02
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

/**
 * Middleware: parse and validate numeric :id param
 */
const parseNumericId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    const err = new Error("ID must be a number");
    err.statusCode = 400;
    return next(err);
  }

  req.params.id = id;
  next();
};

/**
 * Middleware: validate and parse birthday from body
 */
const parseBirthday = (req, res, next) => {
  const { birthday } = req.body;

  if (!birthday) {
    const err = new Error("Birthday is required");
    err.statusCode = 400;
    return next(err);
  }

  const parsedDate = parseDDMMYYYY(birthday);

  if (!parsedDate) {
    const err = new Error("Invalid date format. Expected DD/MM/YYYY");
    err.statusCode = 400;
    return next(err);
  }

  req.body.birthday = parsedDate;
  next();
};


/**
 * Check if given year/month is in the past
 */
const isPastMonth = (year, month) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    year < currentYear ||
    (year === currentYear && month < currentMonth)
  );
};


module.exports = {
  parseDDMMYYYY,
  parseNumericId,
  parseBirthday,
  isPastMonth,
};
