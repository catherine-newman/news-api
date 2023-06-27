const db = require("../connection");
const { checkExists } = require("./utils-model")

exports.selectArticle = async (article_id) => {
    const data = await db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id]);
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}

exports.selectArticleComments = async (article_id) => {
    const data = await db.query("SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id]);
    if (!data.rows.length) {
        await checkExists("articles", "article_id", article_id);
        return [];
    }
    return data.rows;
}