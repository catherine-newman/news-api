const { selectArticle, selectArticles, selectArticleComments, insertComment, updateArticle } = require("../models/articles-model");

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
    const { topic, sort_by, order } = req.query;
    try {
        const data = await selectArticles(topic, sort_by, order);
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

exports.patchArticle = async (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    try {
        const data = await updateArticle(article_id, inc_votes);
        res.status(200).send({ article : data });
    } catch(err) {
        return next(err);
    }
}