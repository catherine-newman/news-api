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

describe("GET /api", () => {
    test("responds with an object describing all the available endpoints, each endpoint including a description, queries, format and example response", async () => {
        const res = await request(app)
        .get("/api")
        .expect(200);
        expect(typeof res.body.endpoints).toBe("object");
        for (const key in res.body.endpoints) {
            expect(res.body.endpoints[key]).toHaveProperty("description", expect.any(String));
            expect(res.body.endpoints[key]).toHaveProperty("queries", expect.any(Array));
            expect(res.body.endpoints[key]).toHaveProperty("format", expect.any(String));
            expect(res.body.endpoints[key]).toHaveProperty("exampleResponse", expect.any(Object));
        }
        // res.body.endpoints.forEach(topic => {
        //     expect(typeof topic).toBe("object");
        //     expect(topic).toHaveProperty("slug", expect.any(String));
        //     expect(topic).toHaveProperty("description", expect.any(String));
        // });
    })
});

describe("GET /api/topics", () => {
    test("responds with an array of topic objects, each with the 'slug' and 'description' properties", async () => {
        const res = await request(app)
        .get("/api/topics")
        .expect(200);
        expect(Array.isArray(res.body.topics)).toBe(true);
        expect(res.body.topics).toHaveLength(3);
        res.body.topics.forEach(topic => {
            expect(typeof topic).toBe("object");
            expect(topic).toHaveProperty("slug", expect.any(String));
            expect(topic).toHaveProperty("description", expect.any(String));
        });
    })
});