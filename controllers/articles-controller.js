const {
  selectArticle,
  selectArticles,
  selectArticleComments,
  insertComment,
  updateArticle,
  insertArticle,
  deleteArticleModel,
} = require("../models/articles-model");

exports.getArticle = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const data = await selectArticle(article_id);
    res.status(200).send({ article: data });
  } catch (err) {
    return next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  const { topic, author, sort_by, order, limit, p, total_count } = req.query;
  try {
    const data = await selectArticles(
      topic,
      author,
      sort_by,
      order,
      limit,
      p,
      total_count
    );
    res.status(200).send(data);
  } catch (err) {
    return next(err);
  }
};

exports.getArticleComments = async (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  try {
    const data = await selectArticleComments(article_id, limit, p);
    res.status(200).send({ comments: data });
  } catch (err) {
    return next(err);
  }
};

exports.postArticleComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  try {
    const data = await insertComment(article_id, username, body);
    res.status(201).send({ comment: data });
  } catch (err) {
    return next(err);
  }
};

exports.patchArticle = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  try {
    const data = await updateArticle(article_id, inc_votes);
    res.status(200).send({ article: data });
  } catch (err) {
    return next(err);
  }
};

exports.postArticle = async (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  try {
    const data = await insertArticle(
      author,
      title,
      body,
      topic,
      article_img_url
    );
    res.status(201).send({ article: data });
  } catch (err) {
    return next(err);
  }
};

exports.deleteArticle = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    await deleteArticleModel(article_id);
    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
