const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Log = require("../src/models/log_schema");

/*
 C:
 Unit tests for the Logs service endpoints required by the project:
 - POST /api/add
 - GET /api/logs

 Rules validated by this file:
 - Logs are persisted to MongoDB via Logs service
 - Error replies are formatted as {id, message}
*/

describe("Logs service API", () => {
  let mongoServer;

  beforeAll(async () => {
    // Logs service writes directly to MongoDB; it does not forward logs.
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Log.deleteMany({});
  });

  test("POST /api/add stores a log", async () => {
    // ++c This endpoint is called by other services to store logs in DB
    const response = await request(app).post("/api/add").send({
      request: "GET /api/logs",
      statusCode: 200,
      durationMs: 5,
      message: "ok",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ ok: true });

    // ++c The logs service self-logs each request, so we expect at least:
    // - the posted log entry
    // - the request log entry for POST /api/add
    const logs = await Log.find({});
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(
      logs.some((l) => l.request === "GET /api/logs" && l.message === "ok")
    ).toBe(true);
  });

  test("GET /api/logs returns stored logs", async () => {
    // ++c Requirement: return a JSON document describing all logs
    await Log.create({
      level: "info",
      request: "GET /x",
      message: "hello",
      time: new Date(),
      data: { statusCode: 200, durationMs: 1 },
    });

    const response = await request(app).get("/api/logs");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // ++c At least one stored log must be present; request logging may add more
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(
      response.body.some((l) => l.request === "GET /x" && l.message === "hello")
    ).toBe(true);
  });

  test("Unknown route returns 404 {id,message}", async () => {
    // ++c Requirement: errors include id + message
    const response = await request(app).get("/api/does-not-exist");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      id: 404,
      message: "Route: /api/does-not-exist not found",
    });
  });
});

