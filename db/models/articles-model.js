const db = require("../connection");

exports.selectArticle = async (article_id) => {
    const data = await db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id]);
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}