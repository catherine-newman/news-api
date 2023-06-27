const express = require("express");
const { getTopics } = require("./controllers/topics-controller");
const { getEndpoints } = require("./controllers/general-controller");
const { getArticle, getArticles, getArticleComments, postArticleComment, patchArticle } = require("./controllers/articles-controller");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticle);

app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postArticleComment);

app.all("*", (req, res) => {
    res.status(404).send({ status: 404, msg: "Not Found"});
})

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({ msg: "Bad Request" });
    }
    if (err.code === "23503") {
        res.status(401).send({ msg: "Unauthorized" });
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