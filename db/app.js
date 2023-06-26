const express = require("express");
const { getTopics } = require("./controllers/topics-controller");
const { getEndpoints } = require("./controllers/general-controller");
const { getArticle } = require("./controllers/articles-controller");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticle);

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({ msg: "Bad Request" });
    }
    return next(err);
});

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    }
});

module.exports = app;