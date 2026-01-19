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
  isPastMonth,
};
