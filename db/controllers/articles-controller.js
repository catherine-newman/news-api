const { selectArticle, selectArticleComments } = require("../models/articles-model");

exports.getArticle = async (req, res, next) => {
    const { article_id } = req.params;
    try {
        const data = await selectArticle(article_id);
        res.status(200).send({ article : data });
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
}