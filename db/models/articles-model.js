const db = require("../connection");

exports.selectArticle = async (article_id) => {
    const data = await db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id]);
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}

exports.selectArticles = async () => {
    const data = await db.query("SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INTEGER as comment_count FROM articles INNER JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;");
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}