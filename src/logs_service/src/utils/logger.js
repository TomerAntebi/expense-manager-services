/*
 C:
 Pino logger instance.
 Requirement: use Pino for creating log messages.
*/
const pino = require("pino");

const logger = pino({
  // ++c Default log level for this service
  level: "info",
  base: null,
  timestamp: () => `,"time":"${new Date().toISOString()}"`
});

module.exports = logger;

