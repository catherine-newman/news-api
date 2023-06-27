const { selectArticle, selectArticles, selectArticleComments, insertComment } = require("../models/articles-model");

exports.getArticle = async (req, res, next) => {
    const { article_id } = req.params;
    try {
        const data = await selectArticle(article_id);
        res.status(200).send({ article : data });
    } catch(err) {
        return next(err);
    }
};

exports.getArticles = async (req, res, next) => {
    try {
        const data = await selectArticles();
        res.status(200).send({ articles : data });
    } catch(err) {
        return next(err);
    }
};

exports.getArticleComments = async (req, res, next) => {
    const { article_id } = req.params;
    try {
        const data = await selectArticleComments(article_id);
        res.status(200).send({ comments : data })
    } catch(err) {
        return next(err);
    }
};

exports.postArticleComment = async (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
    try {
        const data = await insertComment(article_id, username, body);
        res.status(200).send({ comment : data })
    } catch(err) {
        return next(err);
    }
};