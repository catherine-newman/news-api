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

exports.selectArticles = async () => {
    const data = await db.query("SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INTEGER as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;");
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}


exports.selectArticleComments = async (article_id) => {
    const data = await db.query("SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id]);
    if (!data.rows.length) {
        await checkExists("articles", "article_id", article_id);
        return [];
    }
    return data.rows;
}

exports.insertComment = async (article_id, username, body) => {
    if (!username || !body) return Promise.reject({ status: 400, msg: "Bad Request"});
    await checkExists("articles", "article_id", article_id);
    const data = await db.query("INSERT INTO comments (article_id, author, body, votes, created_at) VALUES ($1, $2, $3, 0, $4) RETURNING *;", [article_id, username, body, new Date().toISOString()]);
    // if (!data.rows.length) {
    //     await checkExists("articles", "article_id", article_id);
    //     return [];
    // }
    return data.rows[0];
}