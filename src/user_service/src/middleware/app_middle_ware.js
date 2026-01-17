const removeMongoId = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const cleaned = removeIdSafe(data);
    return originalJson.call(this, cleaned);
  };

  next();
};

const removeIdSafe = (data) => {
  try {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (key === "_id") return undefined;
        return value;
      })
    );
  } catch {
    return data;
  }
};


module.exports = removeMongoId;
