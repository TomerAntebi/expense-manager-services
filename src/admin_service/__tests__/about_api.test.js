const request = require("supertest");

const app = require("../app");

/*
 C:
 Unit test for the Developers Team endpoint required by the project:
 - GET /api/about
 Must return only first_name and last_name for each team member.

 Rules validated by this file:
 - /api/about does not depend on DB (team members are hardcoded / env-based)
 - Error replies are formatted as {id, message}
*/

describe("Admin/About service API", () => {
  beforeAll(() => {
    process.env.LOG_SERVICE_URL = "http://logs/api/add";

    // About service logs each request by forwarding to the Logs service.
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }));
  });

  test("GET /api/about returns only first_name and last_name", async () => {
    // ++c Requirement: return only first_name + last_name (no extra fields)
    const response = await request(app).get("/api/about");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    for (const entry of response.body) {
      expect(Object.keys(entry).sort()).toEqual(["first_name", "last_name"]);
    }
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

