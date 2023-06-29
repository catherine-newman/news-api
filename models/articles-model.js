const { off } = require("../app");
const db = require("../db/connection");
const { checkExists } = require("./utils-model");
const { deleteArticleComments } = require("./comments-model");
const format = require("pg-format");

exports.selectArticle = async (article_id) => {
    const data = await db.query("SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id", [article_id]);
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}

exports.selectArticles = async (topic, sort_by = "created_at", order = "desc", limit, p, total_count) => {
    const allowedSort = ["created_at", "title", "author", "votes"];
    const allowedOrder = ["asc", "desc"];
    if (!allowedSort.includes(sort_by) || !allowedOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "Bad Request"});
    }
    let queryValues = [];
    let result = {};
    let queryStr = "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INTEGER as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id"
    if (topic) {
        queryStr += " WHERE articles.topic = $1 GROUP BY articles.article_id";
        queryValues.push(topic);
    } else {
        queryStr += " GROUP BY articles.article_id"
    }
    queryStr += format(" ORDER BY %I %s", sort_by, order);
    if (p) {
        if (limit) {
            const offset = limit * (p - 1);
            queryValues.push(limit, offset);
            if (queryValues.length) {
                queryStr += ` LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`
            } else {
                queryStr += " LIMIT $1 OFFSET $2"
            }
        }
        else {
            const offset = 10 * (p - 1);
            queryValues.push(10, offset);
            if (queryValues.length) {
                queryStr += ` LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`
            } else {
                queryStr += " LIMIT $1 OFFSET $2"
            }
        }
    } else if (limit) {
        queryValues.push(limit);
        if (queryValues.length) {
            queryStr += ` LIMIT $${queryValues.length}`
        } else {
            queryStr += " LIMIT $1"
        }
    }
    const data = await db.query(queryStr, queryValues);
    if (!data.rows.length) {
        await checkExists("topics", "slug", topic);
        result.articles = [];
    } else {
        result.articles = data.rows;
    }
    if (total_count) {
        result.total_count = data.rows.length;
    }
    return result;
}


exports.selectArticleComments = async (article_id, limit, p) => {
    let queryValues = [article_id];
    let queryStr = "SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC";
    if (p) {
        if (limit) {
            const offset = limit * (p - 1);
            queryValues.push(limit, offset);
            queryStr += " LIMIT $2 OFFSET $3"
        }
        else {
            const offset = 10 * (p - 1);
            queryValues.push(10, offset);
                queryStr += " LIMIT $2 OFFSET $3"
        }
    } else if (limit) {
        queryValues.push(limit);
            queryStr += " LIMIT $2"
    }
    const data = await db.query(queryStr, queryValues);
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

exports.insertArticle = async (author, title, body, topic, article_img_url) => {
    if (!author || !title || !body || !topic) return Promise.reject({ status: 400, msg: "Bad Request"});
    if (!article_img_url) article_img_url = "https://publicdomainpictures.net/pictures/40000/velka/annoyed-tabby-cat.jpg";
    const data = await db.query("INSERT INTO articles (author, title, body, topic, article_img_url, created_at, votes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;", [author, title, body, topic, article_img_url, new Date().toISOString(), 0]);
    data.rows[0].comment_count = 0;
    return data.rows[0];
}

exports.deleteArticleModel = async (article_id) => {
    await checkExists("articles", "article_id", article_id);
    await deleteArticleComments(article_id);
    return await db.query("DELETE FROM articles WHERE article_id = $1;", [article_id]);
}