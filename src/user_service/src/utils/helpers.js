// utils/dateParser.js
const parseDDMMYYYY = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  // Check if the date is valid (e.g., prevents 31/02/1999)
  return isNaN(date.getTime()) ? null : date;
};

// A reusable middleware function
exports.parseIdMiddleware = (req, res, next) => {
  console.log('userId',req.params.id);
  const parsedId = parseInt(req.params.id, 10);
  console.log('userId',req.params.id);


  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "ID must be a number" });
  }

  // Attach the parsed number back to req so the next function can use it
  req.params.id = parsedId;
  next();
};

exports.validateAndParseBirthday = (req, res, next) => {
  const { birthday } = req.body;

  if (!birthday) {
    return res.status(400).json({ error: "Birthday is required" });
  }

  const parsedDate = parseDDMMYYYY(birthday);

  if (!parsedDate) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Expected DD/MM/YYYY" });
  }

  // Overwrite the string with the real Date object for the next functions
  req.body.birthday = parsedDate;

  // Move to the next function (the controller)
  next();
};
