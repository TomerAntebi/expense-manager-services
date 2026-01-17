exports.validateYearAndMonth = (mode = "report") => {
  return (req, res, next) => {
    const source = mode === "addCost" ? req.body : req.query;
    const userid = Number(source.userid);
    const year = Number(source.year);
    const month = Number(source.month);

    if (isNaN(userid)) {
      return res.status(400).json({ error: "User id must be a number." });
    }

    if (year && !Number.isInteger(year)) {
      return res.status(400).json({
        error: "year must be an integer",
      });
    }

    if (month && (!Number.isInteger(month) || month < 1 || month > 12)) {
      return res.status(400).json({
        error: "month must be an integer between 1 and 12",
      });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (mode === "addCost") {
      if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
      ) {
        return res.status(400).json({
          error: "cannot add cost item to the past",
        });
      }
    }

    source.userid = userid;
    source.year = year;
    source.month = month;

    next();
  };
};
