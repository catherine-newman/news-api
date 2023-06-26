const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    if (db.end) db.end();
});

describe("GET /api/topics", () => {
    test("responds with an array of topic objects, each with the 'slug' and 'description' properties", async () => {
        const res = await request(app)
        .get("/api/topics")
        .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(3);
        res.body.forEach(topic => {
            expect(typeof topic).toBe("object");
            expect(topic).toHaveProperty("slug", expect.any(String));
            expect(topic).toHaveProperty("description", expect.any(String));
        });
    })
});