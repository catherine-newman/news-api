const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

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
        expect(res.body.endpoints).toEqual(endpoints);
        for (const key in res.body.endpoints) {
            expect(res.body.endpoints[key]).toHaveProperty("description", expect.any(String));
            expect(res.body.endpoints[key]).toHaveProperty("queries", expect.any(Array));
            expect(res.body.endpoints[key]).toHaveProperty("format", expect.any(String));
            expect(res.body.endpoints[key]).toHaveProperty("exampleResponse", expect.any(Object));
        }
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

describe("GET /api/articles/:article_id", () => {
    test("responds with an article object", async () => {
        const res = await request(app)
        .get("/api/articles/1")
        .expect(200);
        const article = res.body.article;
        expect(typeof article).toBe("object");
        expect(article).toHaveProperty("author", "butter_bridge");
        expect(article).toHaveProperty("title", "Living in the shadow of a great man");
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("body", "I find this existence challenging");
        expect(article).toHaveProperty("topic", "mitch");
        expect(article).toHaveProperty("created_at", "2020-07-09T20:11:00.000Z");
        expect(article).toHaveProperty("votes", 100);
        expect(article).toHaveProperty("article_img_url", "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
    })
    test("status:404, responds with an error message when there are no matches", async () => {
        const res = await request(app)
        .get("/api/articles/50")
        .expect(404);
        expect(res.body.msg).toBe("Not Found");
    })
    test("status:400, responds with an error message when the article id is not an integer", async () => {
        const res = await request(app)
        .get("/api/articles/banana")
        .expect(400);
        expect(res.body.msg).toBe("Bad Request");
    })
});

describe("GET /api/articles/:article_id/comments", () => {
    test("responds with an array of comments for the specified article_id", async () => {
        const res = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);
        const comments = res.body.comments;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments).toHaveLength(11);
        comments.forEach(comment => {
            expect(typeof comment).toBe("object");
            expect(Object.keys(comment)).toHaveLength(6);
            expect(comment).toHaveProperty("comment_id", expect.any(Number));
            expect(comment).toHaveProperty("votes", expect.any(Number));
            expect(comment).toHaveProperty("created_at", expect.any(String));
            expect(comment).toHaveProperty("author", expect.any(String));
            expect(comment).toHaveProperty("body", expect.any(String));
            expect(comment).toHaveProperty("article_id", expect.any(Number));
        })
    })
    test("comments should be sorted by most recent first", async () => {
        const res = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);
        const comments = res.body.comments;
        expect(comments).toBeSortedBy("created_at", { descending : true });
    })
    test("status:404, responds with an error message when there are no matches", async () => {
        const res = await request(app)
        .get("/api/articles/50/comments")
        .expect(404);
        expect(res.body.msg).toBe("Not Found");
    })
    test("status:400, responds with an error message when the article id is not an integer", async () => {
        const res = await request(app)
        .get("/api/articles/banana/comments")
        .expect(400);
        expect(res.body.msg).toBe("Bad Request");
    })
});