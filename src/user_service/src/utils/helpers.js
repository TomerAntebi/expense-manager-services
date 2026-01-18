// utils/dateParser.js
const parseDDMMYYYY = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);

  // ++c Strict validation: reject invalid dates like 31/02/2020
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

// A reusable middleware function
exports.parseIdMiddleware = (req, res, next) => {
  const parsedId = parseInt(req.params.id, 10);

  if (isNaN(parsedId)) {
    const err = new Error("ID must be a number");
    err.statusCode = 400;
    return next(err);
  }

  // Attach the parsed number back to req so the next function can use it
  req.params.id = parsedId;
  next();
};

exports.validateAndParseBirthday = (req, res, next) => {
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

  // Overwrite the string with the real Date object for the next functions
  req.body.birthday = parsedDate;

  // Move to the next function (the controller)
  next();
};
