const express = require("express");
const { getTopics } = require("./controllers/topics-controller");
const { getEndpoints } = require("./controllers/general-controller");
const { getArticle, getArticles, getArticleComments } = require("./controllers/articles-controller");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles/:article_id/comments", getArticleComments);

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
    return next(err);
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' });
    console.log(err)
});

module.exports = app;