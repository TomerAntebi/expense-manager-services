const pino = require("pino");

const logger = pino({
  level: "info",
  base: null,
  timestamp: () => `,"time":"${new Date().toISOString()}"`
});

module.exports=logger;

