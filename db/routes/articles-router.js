const articlesRouter = require("express").Router();
const { getArticle, getArticles, getArticleComments, postArticleComment, patchArticle, postArticle } = require("../controllers/articles-controller");

articlesRouter
.route("/")
.get(getArticles)
.post(postArticle);

articlesRouter
.route("/:article_id")
.get(getArticle)
.patch(patchArticle);

articlesRouter
.route("/:article_id/comments")
.get(getArticleComments)
.post(postArticleComment);

module.exports = articlesRouter;

