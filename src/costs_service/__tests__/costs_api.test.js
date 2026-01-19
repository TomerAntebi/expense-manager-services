const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Cost = require("../src/models/cost_schema");
const Report = require("../src/models/report_schema");

/*
 C:
 Unit tests for the Costs service endpoints required by the project:
 - POST /api/add
 - GET /api/report
 Plus an internal helper endpoint used by Users service:
 - GET /api/total/:userid

 Rules validated by this file:
 - Error replies are formatted as {id, message}
 - Costs are grouped by required categories in monthly report
 - Computed/cached report behavior for past months (Computed Design Pattern)
 - Adding costs to a past month is not allowed (only current/future)
*/

describe("Costs service API", () => {
  let mongoServer;

  beforeAll(async () => {
    process.env.LOG_SERVICE_URL = "http://logs/api/add";
    process.env.USER_SERVICE_URL = "http://users/api/users/";

    global.fetch = jest.fn(async (url, options) => {
      // Validation call to Users service
      if (String(url).startsWith(process.env.USER_SERVICE_URL)) {
        return { ok: true };
      }

      // Log forwarding call
      if (String(url).startsWith(process.env.LOG_SERVICE_URL)) {
        return { ok: true, json: async () => ({ ok: true }) };
      }

      return { ok: true, json: async () => ({ ok: true }) };
    });

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Cost.deleteMany({});
    await Report.deleteMany({});
  });

  test("POST /api/add adds a new cost item (required fields only)", async () => {
    // ++c Required fields: userid, description, category, sum
    const response = await request(app)
      .post("/api/add")
      .send({ userid: 123123, description: "milk 9", category: "food", sum: 8 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      userid: 123123,
      description: "milk 9",
      category: "food",
      sum: 8,
    });
  });

  test("POST /api/add applies default date if not provided", async () => {
    // ++c Requirement: if date/time is not passed, server uses request time
    const response = await request(app)
      .post("/api/add")
      .send({ userid: 123123, description: "milk 9", category: "food", sum: 8 });

    expect(response.statusCode).toBe(201);
    expect(response.body.date).toBeTruthy();
    expect(new Date(response.body.date).toString()).not.toBe("Invalid Date");
  });

  test("POST /api/add rejects costs with a past date", async () => {
    // ++c Requirement: server doesn't allow adding costs with dates in the past
    const response = await request(app)
      .post("/api/add")
      .send({
        userid: 123123,
        description: "old milk",
        category: "food",
        sum: 8,
        date: "2020-01-05T00:00:00.000Z",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Cannot add cost item to a past month",
    });
  });

  test.each([
    // ++c Examples from requirement: sum values that are not valid numbers
    ["0300"],
    ["a3"],
    [""],
    [0],
  ])("POST /api/add rejects invalid sum=%p", async (badSum) => {
    const response = await request(app)
      .post("/api/add")
      .send({
        userid: 123123,
        description: "milk",
        category: "food",
        sum: badSum,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "sum must be a positive number",
    });
  });

  test("POST /api/add rejects invalid category", async () => {
    // ++c Allowed categories: food, health, housing, sports, education
    const response = await request(app).post("/api/add").send({
      userid: 123123,
      description: "milk",
      category: "invalid",
      sum: 8,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Invalid cost category",
    });
  });

  test("POST /api/add rejects non-integer userid", async () => {
    // ++c userid must be a Number (integer) according to the requirement
    const response = await request(app).post("/api/add").send({
      userid: "123123",
      description: "milk",
      category: "food",
      sum: 8,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "userid must be an integer",
    });
  });

  test("POST /api/add rejects invalid date", async () => {
    // ++c If date is provided, it must be a valid date string
    const response = await request(app).post("/api/add").send({
      userid: 123123,
      description: "milk",
      category: "food",
      sum: 8,
      date: "not-a-date",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Invalid date",
    });
  });

  test("POST /api/add returns 500 when Users service is unreachable", async () => {
    // ++c Requirement: adding a cost must validate user exists.
    // ++c If Users service is unreachable, this is a server error (500), not 404.
    // ++c Override only the next fetch call (user validation) so this mock
    // doesn't leak into other tests (e.g. report tests).
    global.fetch.mockImplementationOnce(async (url) => {
      if (String(url).startsWith(process.env.USER_SERVICE_URL)) {
        throw new Error("network down");
      }
      return { ok: true, json: async () => ({ ok: true }) };
    });

    const response = await request(app).post("/api/add").send({
      userid: 123123,
      description: "milk",
      category: "food",
      sum: 8,
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      id: 500,
      message: "User service is unreachable",
    });
  });

  test("GET /api/report returns costs grouped by category (uses query id/year/month)", async () => {
    // ++c Requirement: report query params: id, year, month
    await Cost.create([
      {
        userid: 123123,
        description: "choco",
        category: "food",
        sum: 12,
        date: new Date("2026-01-17T10:00:00.000Z"),
      },
      {
        userid: 123123,
        description: "java book",
        category: "education",
        sum: 112,
        date: new Date("2026-01-12T10:00:00.000Z"),
      },
    ]);

    const response = await request(app).get(
      "/api/report?id=123123&year=2026&month=1"
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      userid: 123123,
      year: 2026,
      month: 1,
    });

    const costsArray = response.body.costs;
    expect(Array.isArray(costsArray)).toBe(true);

    const foodBucket = costsArray.find((b) => b.food);
    const educationBucket = costsArray.find((b) => b.education);

    expect(foodBucket.food).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sum: 12, description: "choco", day: 17 }),
      ])
    );
    expect(educationBucket.education).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sum: 112, description: "java book", day: 12 }),
      ])
    );
  });

  test("GET /api/report rejects missing id", async () => {
    // ++c Missing id should be treated as invalid input (400)
    const response = await request(app).get("/api/report?year=2026&month=1");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "User id must be a number",
    });
  });

  test("GET /api/report rejects invalid month", async () => {
    // ++c Month must be an integer between 1 and 12
    const response = await request(app).get("/api/report?id=123123&year=2026&month=13");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Month must be an integer between 1 and 12",
    });
  });

  test("GET /api/report rejects year < 1900", async () => {
    const response = await request(app).get("/api/report?id=123123&year=1800&month=1");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Year must be >= 1900",
    });
  });

  test("GET /api/report caches past-month reports in the reports collection", async () => {
    // ++c Requirement: Computed Design Pattern - cache past-month reports
    await Cost.create([
      {
        userid: 123123,
        description: "old choco",
        category: "food",
        sum: 12,
        date: new Date("2020-01-17T10:00:00.000Z"),
      },
    ]);

    const first = await request(app).get(
      "/api/report?id=123123&year=2020&month=1"
    );
    expect(first.statusCode).toBe(200);

    const afterFirst = await Report.countDocuments({
      userid: 123123,
      year: 2020,
      month: 1,
    });
    expect(afterFirst).toBe(1);

    const second = await request(app).get(
      "/api/report?id=123123&year=2020&month=1"
    );
    expect(second.statusCode).toBe(200);

    const afterSecond = await Report.countDocuments({
      userid: 123123,
      year: 2020,
      month: 1,
    });
    expect(afterSecond).toBe(1);
  });

  test("GET /api/total/:userid returns total sum for a user (used by Users service)", async () => {
    // ++c Used by Users service to return the required `total` field
    await Cost.create([
      {
        userid: 123123,
        description: "a",
        category: "food",
        sum: 5,
        date: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        userid: 123123,
        description: "b",
        category: "health",
        sum: 7,
        date: new Date("2026-01-02T10:00:00.000Z"),
      },
    ]);

    const response = await request(app).get("/api/total/123123");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ userid: 123123, total: 12 });
  });

  test("GET /api/total/:userid rejects invalid userid", async () => {
    // ++c userid must be numeric integer
    const response = await request(app).get("/api/total/abc");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "userid must be an integer",
    });
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

