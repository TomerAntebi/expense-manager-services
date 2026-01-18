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

  test("POST /api/add applies default createdAt if not provided", async () => {
    const response = await request(app)
      .post("/api/add")
      .send({ userid: 123123, description: "milk 9", category: "food", sum: 8 });

    expect(response.statusCode).toBe(201);
    expect(response.body.createdAt).toBeTruthy();
    expect(new Date(response.body.createdAt).toString()).not.toBe("Invalid Date");
  });

  test("POST /api/add rejects costs with a past date", async () => {
    const response = await request(app)
      .post("/api/add")
      .send({
        userid: 123123,
        description: "old milk",
        category: "food",
        sum: 8,
        createdAt: "2020-01-05T00:00:00.000Z",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Cannot add cost item to a past month",
    });
  });

  test.each([
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

  test("POST /api/add rejects invalid createdAt", async () => {
    const response = await request(app).post("/api/add").send({
      userid: 123123,
      description: "milk",
      category: "food",
      sum: 8,
      createdAt: "not-a-date",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Invalid createdAt",
    });
  });

  test("POST /api/add returns 500 when Users service is unreachable", async () => {
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
    await Cost.create([
      {
        userid: 123123,
        description: "choco",
        category: "food",
        sum: 12,
        createdAt: new Date("2026-01-17T10:00:00.000Z"),
      },
      {
        userid: 123123,
        description: "java book",
        category: "education",
        sum: 112,
        createdAt: new Date("2026-01-12T10:00:00.000Z"),
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
    const response = await request(app).get("/api/report?year=2026&month=1");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "User id must be a number",
    });
  });

  test("GET /api/report rejects invalid month", async () => {
    const response = await request(app).get("/api/report?id=123123&year=2026&month=13");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Month must be an integer between 1 and 12",
    });
  });

  test("GET /api/report caches past-month reports in the reports collection", async () => {
    await Cost.create([
      {
        userid: 123123,
        description: "old choco",
        category: "food",
        sum: 12,
        createdAt: new Date("2020-01-17T10:00:00.000Z"),
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
    await Cost.create([
      {
        userid: 123123,
        description: "a",
        category: "food",
        sum: 5,
        createdAt: new Date("2026-01-01T10:00:00.000Z"),
      },
      {
        userid: 123123,
        description: "b",
        category: "health",
        sum: 7,
        createdAt: new Date("2026-01-02T10:00:00.000Z"),
      },
    ]);

    const response = await request(app).get("/api/total/123123");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ userid: 123123, total: 12 });
  });

  test("GET /api/total/:userid rejects invalid userid", async () => {
    const response = await request(app).get("/api/total/abc");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "userid must be an integer",
    });
  });

  test("Unknown route returns 404 {id,message}", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      id: 404,
      message: "Route: /api/does-not-exist not found",
    });
  });
});

