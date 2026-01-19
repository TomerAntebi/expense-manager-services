const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../src/models/user_schema");

/*
 C:
 Unit tests for the Users service endpoints required by the project:
 - POST /api/add
 - GET /api/users
 - GET /api/users/:id (must include `total`)

 Rules validated by this file:
 - Error replies are formatted as {id, message}
 - Birthday input is validated (strict DD/MM/YYYY)
 - User details endpoint returns total costs (computed via Costs service)
*/

describe("Users service API", () => {
  let mongoServer;

  beforeAll(async () => {
    process.env.LOG_SERVICE_URL = "http://logs/api/add";
    process.env.COST_SERVICE_URL = "http://costs";

    global.fetch = jest.fn(async (url, options) => {
      // Costs total call
      if (String(url).includes("/api/total/")) {
        return { ok: true, json: async () => ({ total: 30 }) };
      }

      // Log forwarding call
      if (options && options.method === "POST") {
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
    await User.deleteMany({});
  });

  test("POST /api/add adds a new user", async () => {
    // ++c Required fields: id, first_name, last_name, birthday
    const response = await request(app).post("/api/add").send({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
      birthday: "01/01/2000",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
    });
  });

  test("POST /api/add rejects missing birthday", async () => {
    // ++c Validation required by project
    const response = await request(app).post("/api/add").send({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Birthday is required",
    });
  });

  test("POST /api/add rejects invalid birthday date (strict DD/MM/YYYY)", async () => {
    // ++c Strict validation rejects invalid calendar dates like 31/02
    const response = await request(app).post("/api/add").send({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
      birthday: "31/02/2020",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "Invalid date format. Expected DD/MM/YYYY",
    });
  });

  test("GET /api/users lists all users", async () => {
    // ++c Requirement: list users with same fields as users collection
    await User.create({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
      birthday: new Date("2000-01-01T00:00:00.000Z"),
    });

    const response = await request(app).get("/api/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 123123,
          first_name: "mosh",
          last_name: "israeli",
        }),
      ])
    );
  });

  test("GET /api/users/:id returns user details including total", async () => {
    // ++c Requirement: reply includes first_name, last_name, id, total
    await User.create({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
      birthday: new Date("2000-01-01T00:00:00.000Z"),
    });

    const response = await request(app).get("/api/users/123123");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      first_name: "mosh",
      last_name: "israeli",
      id: 123123,
      total: 30,
    });
  });

  test("GET /api/users/:id rejects invalid id", async () => {
    // ++c Validation: id param must be numeric
    const response = await request(app).get("/api/users/abc");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      id: 400,
      message: "ID must be a number",
    });
  });

  test("GET /api/users/:id returns 404 when user not found", async () => {
    // ++c User not found => 404 error from service layer
    const response = await request(app).get("/api/users/999");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      id: 404,
      message: "User not found",
    });
  });

  test("GET /api/users/:id returns 500 when Costs service fails", async () => {
    // ++c total is fetched from Costs service; dependency failure => 500
    await User.create({
      id: 123123,
      first_name: "mosh",
      last_name: "israeli",
      birthday: new Date("2000-01-01T00:00:00.000Z"),
    });

    global.fetch = jest.fn(async (url, options) => {
      if (String(url).includes("/api/total/")) {
        return { ok: false, status: 500, json: async () => ({}) };
      }
      if (options && options.method === "POST") {
        return { ok: true, json: async () => ({ ok: true }) };
      }
      return { ok: true, json: async () => ({ ok: true }) };
    });

    const response = await request(app).get("/api/users/123123");
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      id: 500,
      message: "Failed to fetch total costs",
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

