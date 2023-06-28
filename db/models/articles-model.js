const db = require("../connection");
const { checkExists } = require("./utils-model");
const format = require("pg-format");

exports.selectArticle = async (article_id) => {
    const data = await db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id]);
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}

exports.selectArticles = async (topic, sort_by = "created_at", order = "desc") => {
    const allowedSort = ["created_at", "title", "author", "votes"];
    const allowedOrder = ["asc", "desc"];
    if (!allowedSort.includes(sort_by) || !allowedOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "Bad Request"});
    }
    let queryValues = [];
    let queryStr = "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INTEGER as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id"
    if (topic) {
        queryStr += " WHERE articles.topic = $1 GROUP BY articles.article_id";
        queryValues.push(topic);
    } else {
        queryStr += " GROUP BY articles.article_id"
    }
    queryStr += format(" ORDER BY %I %s", sort_by, order);
    const data = await db.query(queryStr, queryValues);
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
    return data.rows[0];
}

exports.updateArticle = async (article_id, inc_votes) => {
    if (!inc_votes) return Promise.reject({ status: 400, msg: "Bad Request"});
    await checkExists("articles", "article_id", article_id);
    const data = await db.query("UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;", [inc_votes, article_id]);
    return data.rows[0];
}