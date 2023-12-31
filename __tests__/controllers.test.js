const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");
const { checkExists } = require("../models/utils-model");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  if (db.end) db.end();
});

describe("catch all endpoint to handle calls to endpoints that don't exist", () => {
  test("GET status:404, responds with an error message when the endpoint doesn't exist", async () => {
    const res = await request(app).get("/dfgdfgdfg").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("POST status:404, responds with an error message when the endpoint doesn't exist", async () => {
    const res = await request(app).post("/dfgdfgdfg").send({}).expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("PATCH status:404, responds with an error message when the endpoint doesn't exist", async () => {
    const res = await request(app).patch("/dfgdfgdfg").send({}).expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("DELETE status:404, responds with an error message when the endpoint doesn't exist", async () => {
    const res = await request(app).delete("/dfgdfgdfg").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
});

describe("GET /api", () => {
  test("responds with an object describing all the available endpoints, each endpoint including a description, queries, format and example response", async () => {
    const res = await request(app).get("/api").expect(200);
    expect(res.body.endpoints).toEqual(endpoints);
    for (const key in res.body.endpoints) {
      expect(Object.keys(res.body.endpoints[key])).toHaveLength(4);
      expect(res.body.endpoints[key]).toHaveProperty(
        "description",
        expect.any(String)
      );
      expect(res.body.endpoints[key]).toHaveProperty(
        "queries",
        expect.any(Array)
      );
      expect(res.body.endpoints[key]).toHaveProperty("format");
      expect(res.body.endpoints[key]).toHaveProperty(
        "exampleResponse",
        expect.any(Object)
      );
    }
  });
});

describe("GET /api/topics", () => {
  test("responds with an array of topic objects, each with the 'slug' and 'description' properties", async () => {
    const res = await request(app).get("/api/topics").expect(200);
    expect(res.body.topics).toHaveLength(3);
    res.body.topics.forEach((topic) => {
      expect(Object.keys(topic)).toHaveLength(2);
      expect(topic).toHaveProperty("slug", expect.any(String));
      expect(topic).toHaveProperty("description", expect.any(String));
    });
  });
});

describe("GET /api/articles", () => {
  test("responds with an array of all articles as objects", async () => {
    const res = await request(app).get("/api/articles").expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(13);
    articles.forEach((article) => {
      expect(Object.keys(article)).toHaveLength(8);
      expect(article).toHaveProperty("author", expect.any(String));
      expect(article).toHaveProperty("title", expect.any(String));
      expect(article).toHaveProperty("article_id", expect.any(Number));
      expect(article).toHaveProperty("topic", expect.any(String));
      expect(article).toHaveProperty("created_at", expect.any(String));
      expect(article).toHaveProperty("votes", expect.any(Number));
      expect(article).toHaveProperty("article_img_url", expect.any(String));
      expect(article).toHaveProperty("comment_count", expect.any(Number));
    });
  });
  test("article objects should be sorted by date in descending order as default", async () => {
    const res = await request(app).get("/api/articles").expect(200);
    const articles = res.body.articles;
    expect(articles).toBeSortedBy("created_at", { descending: true });
  });
  test("articles can be sorted by title", async () => {
    const res = await request(app)
      .get("/api/articles?sort_by=title")
      .expect(200);
    const articles = res.body.articles;
    expect(articles).toBeSortedBy("title", { descending: true });
  });
  test("articles can be sorted by comment_count", async () => {
    const res = await request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200);
    const articles = res.body.articles;
    expect(articles).toBeSortedBy("comment_count", { descending: true });
  });
  test("articles can be sorted in ascending order", async () => {
    const res = await request(app).get("/api/articles?order=asc").expect(200);
    const articles = res.body.articles;
    expect(articles).toBeSortedBy("created_at", { descending: false });
  });
  test("articles can be filtered by topic", async () => {
    const res = await request(app).get("/api/articles?topic=cats").expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(1);
    expect(articles[0]).toHaveProperty("topic", "cats");
  });
  test("articles can be filtered by author", async () => {
    const res = await request(app)
      .get("/api/articles?author=rogersop")
      .expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(3);
    articles.forEach((article) => {
      expect(article).toHaveProperty("author", "rogersop");
    });
  });
  test("the number of articles in the response can be limited", async () => {
    const res = await request(app).get("/api/articles?limit=5").expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(5);
  });
  test("the number of articles in the response can be limited, starting from a certain page - p", async () => {
    const res = await request(app).get("/api/articles?limit=5&p=2").expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(5);
    expect(articles[0]).toHaveProperty("article_id", 5);
  });
  test("limit defaults to 10 when p is specified with no limit", async () => {
    const res = await request(app).get("/api/articles?p=2").expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(3);
  });
  test("the number of articles returned can be included as a property in the response, discounting any limit provided", async () => {
    const res = await request(app)
      .get("/api/articles?total_count=true")
      .expect(200);
    expect(res.body.total_count).toBe(13);
  });
  test("status:404, responds with an error message when the filtering topic doesn't exist", async () => {
    const res = await request(app)
      .get("/api/articles?topic=banana")
      .expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:404, responds with an error message when the filtering author doesn't exist", async () => {
    const res = await request(app)
      .get("/api/articles?author=banana")
      .expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:200, responds with an empty array when there are no matching articles but request is valid", async () => {
    const res = await request(app).get("/api/articles?topic=paper").expect(200);
    const articles = res.body.articles;
    expect(articles).toEqual([]);
  });
  test("status:400, responds with an error message when trying to sort by a column that is not allowed", async () => {
    const res = await request(app)
      .get("/api/articles?sort_by=body")
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when trying to order by a method that is not allowed", async () => {
    const res = await request(app)
      .get("/api/articles?order=banana")
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("responds correctly when passed all query types at once", async () => {
    const res = await request(app)
      .get(
        "/api/articles?topic=mitch&sort_by=author&order=asc&limit=5&p=2&total_count=true"
      )
      .expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(5);
    expect(articles[0]).toHaveProperty("article_id", 6);
    expect(articles).toBeSortedBy("author", { descending: false });
    articles.forEach((article) => {
      expect(article).toHaveProperty("topic", "mitch");
    });
    expect(res.body.total_count).toBe(12);
  });
  test("responds correctly when passed topic and author filter at once", async () => {
    const res = await request(app)
      .get("/api/articles?topic=mitch&author=rogersop&total_count=true")
      .expect(200);
    const articles = res.body.articles;
    expect(articles).toHaveLength(2);
    articles.forEach((article) => {
      expect(article).toHaveProperty("topic", "mitch");
      expect(article).toHaveProperty("author", "rogersop");
    });
    expect(res.body.total_count).toBe(2);
  });
});

describe("GET /api/users", () => {
  test("responds with an array of all users as objects", async () => {
    const res = await request(app).get("/api/users").expect(200);
    const users = res.body.users;
    expect(users).toHaveLength(4);
    users.forEach((user) => {
      expect(Object.keys(user)).toHaveLength(3);
      expect(user).toHaveProperty("username", expect.any(String));
      expect(user).toHaveProperty("name", expect.any(String));
      expect(user).toHaveProperty("avatar_url", expect.any(String));
    });
  });
});

describe("POST /api/users", () => {
  test("adds a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "elephant",
        name: "nelly",
        avatar_url:
          "https://www.publicdomainpictures.net/pictures/110000/velka/elephant-1414672044fCi.jpg",
      })
      .expect(201);
    const result = await db.query(
      "SELECT * FROM users WHERE username = 'elephant';"
    );
    expect(result.rows).toHaveLength(1);
  });
  test("responds with the posted user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "elephant",
        name: "nelly",
        avatar_url:
          "https://www.publicdomainpictures.net/pictures/110000/velka/elephant-1414672044fCi.jpg",
      })
      .expect(201);
    const user = res.body.user;
    expect(Object.keys(user)).toHaveLength(3);
    expect(user).toHaveProperty("username", "elephant");
    expect(user).toHaveProperty("name", "nelly");
    expect(user).toHaveProperty(
      "avatar_url",
      "https://www.publicdomainpictures.net/pictures/110000/velka/elephant-1414672044fCi.jpg"
    );
  });
  test("status:400, responds with an error message when the request does not follow the desired format", async () => {
    const res = await request(app).post("/api/users").send({}).expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when the username already exists", async () => {
    const res = await request(app)
      .post("/api/topics")
      .send({
        username: "lurker",
        name: "nelly",
        avatar_url:
          "https://www.publicdomainpictures.net/pictures/110000/velka/elephant-1414672044fCi.jpg",
      })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("DELETE /api/users/:username", () => {
  test("deletes the specified user when they have comments and articles associated with them", async () => {
    const res = await request(app)
      .delete("/api/users/butter_bridge")
      .expect(204);
    try {
      await checkExists("users", "username", "butter_bridge");
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("deletes the specified user when they dont have any comments or articles associated with them", async () => {
    const res = await request(app).delete("/api/users/lurker").expect(204);
    try {
      await checkExists("users", "username", "lurker");
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("deletes the comments associated with the user", async () => {
    const res = await request(app)
      .delete("/api/users/butter_bridge")
      .expect(204);
    try {
      await checkExists("comments", "author", "butter_bridge");
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("deletes the articles associated with the user", async () => {
    const res = await request(app)
      .delete("/api/users/butter_bridge")
      .expect(204);
    try {
      await checkExists("articles", "author", "butter_bridge");
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("responds with status 204 and no content", async () => {
    const res = await request(app).delete("/api/users/lurker").expect(204);
    expect(res.body).toEqual({});
  });
  test("status:404, responds with an error message when there are no matching users", async () => {
    const res = await request(app).delete("/api/users/angie").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
});

describe("GET /api/articles/:article_id", () => {
  test("responds with an article object", async () => {
    const res = await request(app).get("/api/articles/1").expect(200);
    const article = res.body.article;
    expect(Object.keys(article)).toHaveLength(9);
    expect(article).toHaveProperty("author", "butter_bridge");
    expect(article).toHaveProperty(
      "title",
      "Living in the shadow of a great man"
    );
    expect(article).toHaveProperty("article_id", 1);
    expect(article).toHaveProperty("body", "I find this existence challenging");
    expect(article).toHaveProperty("topic", "mitch");
    expect(article).toHaveProperty("created_at", "2020-07-09T20:11:00.000Z");
    expect(article).toHaveProperty("votes", 100);
    expect(article).toHaveProperty(
      "article_img_url",
      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    );
    expect(article).toHaveProperty("comment_count", 11);
  });
  test("status:404, responds with an error message when there are no matches", async () => {
    const res = await request(app).get("/api/articles/50").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the article id is not an integer", async () => {
    const res = await request(app).get("/api/articles/banana").expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("responds with an array of comments for the specified article_id", async () => {
    const res = await request(app).get("/api/articles/1/comments").expect(200);
    const comments = res.body.comments;
    expect(comments).toHaveLength(11);
    comments.forEach((comment) => {
      expect(Object.keys(comment)).toHaveLength(6);
      expect(comment).toHaveProperty("comment_id", expect.any(Number));
      expect(comment).toHaveProperty("votes", expect.any(Number));
      expect(comment).toHaveProperty("created_at", expect.any(String));
      expect(comment).toHaveProperty("author", expect.any(String));
      expect(comment).toHaveProperty("body", expect.any(String));
      expect(comment).toHaveProperty("article_id", 1);
    });
  });
  test("comments should be sorted by most recent first", async () => {
    const res = await request(app).get("/api/articles/1/comments").expect(200);
    const comments = res.body.comments;
    expect(comments).toBeSortedBy("created_at", { descending: true });
  });
  test("the number of comments in the response can be limited", async () => {
    const res = await request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200);
    const comments = res.body.comments;
    expect(comments).toHaveLength(5);
  });
  test("the number of comments in the response can be limited, starting from a certain page - p", async () => {
    const res = await request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200);
    const comments = res.body.comments;
    expect(comments).toHaveLength(5);
    expect(comments[0]).toHaveProperty("comment_id", 8);
  });
  test("limit defaults to 10 when p is specified with no limit", async () => {
    const res = await request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200);
    const comments = res.body.comments;
    expect(comments).toHaveLength(1);
  });
  test("status:200, responds with an an empty array when article exists but there are no comments", async () => {
    const res = await request(app).get("/api/articles/4/comments").expect(200);
    expect(res.body.comments).toEqual([]);
  });
  test("status:404, responds with an error message when there are no matching articles", async () => {
    const res = await request(app).get("/api/articles/50/comments").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the article id is not an integer", async () => {
    const res = await request(app)
      .get("/api/articles/banana/comments")
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("adds a comment to the specified article", async () => {
    const res = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "lurker",
        body: "All I can think about are my cat treats hidden in the cupboard.",
      })
      .expect(201);
    const result = await db.query(
      "SELECT * FROM comments WHERE author = 'lurker' AND body = 'All I can think about are my cat treats hidden in the cupboard.'"
    );
    expect(result.rows).toHaveLength(1);
  });
  test("responds with the posted comment", async () => {
    const res = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "lurker",
        body: "All I can think about are my cat treats hidden in the cupboard.",
      })
      .expect(201);
    const comment = res.body.comment;
    expect(Object.keys(comment)).toHaveLength(6);
    expect(comment).toHaveProperty("comment_id", expect.any(Number));
    expect(comment).toHaveProperty("votes", expect.any(Number));
    expect(comment).toHaveProperty("created_at", expect.any(String));
    expect(comment).toHaveProperty("author", "lurker");
    expect(comment).toHaveProperty(
      "body",
      "All I can think about are my cat treats hidden in the cupboard."
    );
    expect(comment).toHaveProperty("article_id", 1);
  });
  test("status:404, responds with an error message when there are no matching articles", async () => {
    const res = await request(app)
      .post("/api/articles/50/comments")
      .send({
        username: "lurker",
        body: "All I can think about are my cat treats hidden in the cupboard.",
      })
      .expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the article id is not an integer", async () => {
    const res = await request(app)
      .post("/api/articles/banana/comments")
      .send({
        username: "lurker",
        body: "All I can think about are my cat treats hidden in the cupboard.",
      })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when the request does not follow the desired format", async () => {
    const res = await request(app)
      .post("/api/articles/1/comments")
      .send({})
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:401, responds with an error message when the user is not in the database", async () => {
    const res = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "angie",
        body: "All I can think about are my cat treats hidden in the cupboard.",
      })
      .expect(401);
    expect(res.body.msg).toBe("Unauthorized");
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("increases the votes for the specified article if passed a positive integer in inc_votes", async () => {
    const res = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(200);
    const article = res.body.article;
    expect(article).toHaveProperty("votes", 110);
  });
  test("decreases the votes for the specified article if passed a negative integer in inc_votes", async () => {
    const res = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(200);
    const article = res.body.article;
    expect(article).toHaveProperty("votes", 90);
  });
  test("responds with the updated article", async () => {
    const res = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(200);
    const article = res.body.article;
    expect(Object.keys(article)).toHaveLength(8);
    expect(article).toHaveProperty("author", "butter_bridge");
    expect(article).toHaveProperty(
      "title",
      "Living in the shadow of a great man"
    );
    expect(article).toHaveProperty("article_id", 1);
    expect(article).toHaveProperty("body", "I find this existence challenging");
    expect(article).toHaveProperty("topic", "mitch");
    expect(article).toHaveProperty("created_at", "2020-07-09T20:11:00.000Z");
    expect(article).toHaveProperty("votes", 110);
    expect(article).toHaveProperty(
      "article_img_url",
      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    );
  });
  test("status:404, responds with an error message when there are no matching articles", async () => {
    const res = await request(app)
      .patch("/api/articles/50")
      .send({ inc_votes: 10 })
      .expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the article id is not an integer", async () => {
    const res = await request(app)
      .patch("/api/articles/banana")
      .send({ inc_votes: 10 })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when inc_votes is not an integer", async () => {
    const res = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "banana" })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when the request does not include inc_votes", async () => {
    const res = await request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("deletes the specified comment", async () => {
    const res = await request(app).delete("/api/comments/1").expect(204);
    try {
      await checkExists("comments", "comment_id", 1);
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("responds with status 204 and no content", async () => {
    const res = await request(app).delete("/api/comments/1").expect(204);
    expect(res.body).toEqual({});
  });
  test("status:404, responds with an error message when there are no matching comments", async () => {
    const res = await request(app).delete("/api/comments/50").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the comment id is not an integer", async () => {
    const res = await request(app).delete("/api/comments/banana").expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("GET /api/users/:username", () => {
  test("responds with a user object", async () => {
    const res = await request(app).get("/api/users/lurker").expect(200);
    const user = res.body.user;
    expect(Object.keys(user)).toHaveLength(3);
    expect(user).toHaveProperty("username", "lurker");
    expect(user).toHaveProperty(
      "avatar_url",
      "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png"
    );
    expect(user).toHaveProperty("name", "do_nothing");
  });
  test("status:404, responds with an error message when there are no matches", async () => {
    const res = await request(app).get("/api/users/angie").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("increases the votes for the specified comment if passed a positive integer in inc_votes", async () => {
    const res = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 10 })
      .expect(200);
    const comment = res.body.comment;
    expect(comment).toHaveProperty("votes", 26);
  });
  test("decreases the votes for the specified comment if passed a negative integer in inc_votes", async () => {
    const res = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -10 })
      .expect(200);
    const comment = res.body.comment;
    expect(comment).toHaveProperty("votes", 6);
  });
  test("responds with the updated comment", async () => {
    const res = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 10 })
      .expect(200);
    const comment = res.body.comment;
    expect(Object.keys(comment)).toHaveLength(6);
    expect(comment).toHaveProperty("author", "butter_bridge");
    expect(comment).toHaveProperty("comment_id", 1);
    expect(comment).toHaveProperty(
      "body",
      "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
    );
    expect(comment).toHaveProperty("created_at", "2020-04-06T12:17:00.000Z");
    expect(comment).toHaveProperty("votes", 26);
    expect(comment).toHaveProperty("article_id", 9);
  });
  test("status:404, responds with an error message when there are no matching comments", async () => {
    const res = await request(app)
      .patch("/api/comments/50")
      .send({ inc_votes: 10 })
      .expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the comment id is not an integer", async () => {
    const res = await request(app)
      .patch("/api/comments/banana")
      .send({ inc_votes: 10 })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when inc_votes is not an integer", async () => {
    const res = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "banana" })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when the request does not include inc_votes", async () => {
    const res = await request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("POST /api/articles", () => {
  test("adds a new article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "The Whiskered Observer: A Feline's Perspective on Human Habits",
        body: "As a superior being adorned with luxurious fur, an eloquent tail, and mesmerizing eyes, I, the ever-watchful feline, have devoted countless hours to studying the peculiar habits of my human companions. From my vantage point on the windowsill, I gaze upon their comings and goings with a mixture of curiosity and amusement.",
        topic: "cats",
        article_img_url:
          "https://c2.staticflickr.com/4/3101/3207571173_42e980b0e4_b.jpg",
      })
      .expect(201);
    const result = await db.query(
      "SELECT * FROM articles WHERE author = 'lurker' AND title = 'The Whiskered Observer: A Feline''s Perspective on Human Habits';"
    );
    expect(result.rows).toHaveLength(1);
  });
  test("responds with the posted article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "The Whiskered Observer: A Feline's Perspective on Human Habits",
        body: "As a superior being adorned with luxurious fur, an eloquent tail, and mesmerizing eyes, I, the ever-watchful feline, have devoted countless hours to studying the peculiar habits of my human companions. From my vantage point on the windowsill, I gaze upon their comings and goings with a mixture of curiosity and amusement.",
        topic: "cats",
        article_img_url:
          "https://c2.staticflickr.com/4/3101/3207571173_42e980b0e4_b.jpg",
      })
      .expect(201);
    const article = res.body.article;
    expect(Object.keys(article)).toHaveLength(9);
    expect(article).toHaveProperty("article_id", expect.any(Number));
    expect(article).toHaveProperty(
      "title",
      "The Whiskered Observer: A Feline's Perspective on Human Habits"
    );
    expect(article).toHaveProperty("topic", "cats");
    expect(article).toHaveProperty("votes", 0);
    expect(article).toHaveProperty("created_at", expect.any(String));
    expect(article).toHaveProperty("comment_count", 0);
    expect(article).toHaveProperty("author", "lurker");
    expect(article).toHaveProperty(
      "article_img_url",
      "https://c2.staticflickr.com/4/3101/3207571173_42e980b0e4_b.jpg"
    );
    expect(article).toHaveProperty(
      "body",
      "As a superior being adorned with luxurious fur, an eloquent tail, and mesmerizing eyes, I, the ever-watchful feline, have devoted countless hours to studying the peculiar habits of my human companions. From my vantage point on the windowsill, I gaze upon their comings and goings with a mixture of curiosity and amusement."
    );
  });
  test("completes the request with a default article_img_url if none is provided", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "The Whiskered Observer: A Feline's Perspective on Human Habits",
        body: "As a superior being adorned with luxurious fur, an eloquent tail, and mesmerizing eyes, I, the ever-watchful feline, have devoted countless hours to studying the peculiar habits of my human companions. From my vantage point on the windowsill, I gaze upon their comings and goings with a mixture of curiosity and amusement.",
        topic: "cats",
      })
      .expect(201);
    const article = res.body.article;
    expect(article).toHaveProperty(
      "article_img_url",
      "https://publicdomainpictures.net/pictures/40000/velka/annoyed-tabby-cat.jpg"
    );
  });
  test("status:401, responds with an error message when the article topic does not exist", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "Bananas",
        body: "Bananas.",
        topic: "bananas",
        article_img_url:
          "https://c2.staticflickr.com/4/3101/3207571173_42e980b0e4_b.jpg",
      })
      .expect(401);
    expect(res.body.msg).toBe("Unauthorized");
  });
  test("status:401, responds with an error message when the user does not exist", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({
        author: "angie",
        title: "Bananas",
        body: "Bananas.",
        topic: "cats",
        article_img_url:
          "https://c2.staticflickr.com/4/3101/3207571173_42e980b0e4_b.jpg",
      })
      .expect(401);
    expect(res.body.msg).toBe("Unauthorized");
  });
  test("status:400, responds with an error message when the request does not follow the desired format", async () => {
    const res = await request(app).post("/api/articles").send({}).expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("POST /api/topics", () => {
  test("adds a new topic", async () => {
    const res = await request(app)
      .post("/api/topics")
      .send({ slug: "dogs", description: "they bark" })
      .expect(201);
    const result = await db.query("SELECT * FROM topics WHERE slug = 'dogs';");
    expect(result.rows).toHaveLength(1);
  });
  test("responds with the posted topic", async () => {
    const res = await request(app)
      .post("/api/topics")
      .send({ slug: "dogs", description: "they bark" })
      .expect(201);
    const topic = res.body.topic;
    expect(Object.keys(topic)).toHaveLength(2);
    expect(topic).toHaveProperty("slug", "dogs");
    expect(topic).toHaveProperty("description", "they bark");
  });
  test("status:400, responds with an error message when the request does not follow the desired format", async () => {
    const res = await request(app).post("/api/topics").send({}).expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
  test("status:400, responds with an error message when the topic already exists", async () => {
    const res = await request(app)
      .post("/api/topics")
      .send({ slug: "cats", description: "Not dogs" })
      .expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("deletes the specified article", async () => {
    const res = await request(app).delete("/api/articles/1").expect(204);
    try {
      await checkExists("articles", "article_id", 1);
    } catch (err) {
      expect(err).toEqual({ msg: "Not Found", status: 404 });
    }
  });
  test("deletes the comments associated with the article", async () => {
    const res = await request(app).delete("/api/articles/1").expect(204);
    const result = db.query("SELECT * FROM comments WHERE article_id = 1;");
    expect(result.body).toBe(undefined);
  });
  test("responds with status 204 and no content", async () => {
    const res = await request(app).delete("/api/articles/1").expect(204);
    expect(res.body).toEqual({});
  });
  test("status:404, responds with an error message when there are no matching articles", async () => {
    const res = await request(app).delete("/api/articles/50").expect(404);
    expect(res.body.msg).toBe("Not Found");
  });
  test("status:400, responds with an error message when the article id is not an integer", async () => {
    const res = await request(app).delete("/api/articles/banana").expect(400);
    expect(res.body.msg).toBe("Bad Request");
  });
});
