const { selectArticle, selectArticles } = require("../models/articles-model");

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
}