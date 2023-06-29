const db = require("../db/connection");
const { checkExists } = require("./utils-model");
const { deleteArticleModel } = require("./articles-model");
const { deleteCommentModel } = require("./comments-model");

exports.selectUsers = async () => {
    const data = await db.query("SELECT username, name, avatar_url FROM users;");
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}

exports.selectUser = async (username) => {
    const data = await db.query("SELECT username, name, avatar_url FROM users WHERE username = $1;", [username]);
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}

exports.insertUser = async (username, name, avatar_url) => {
    if (!username || !name || !avatar_url) return Promise.reject({ status: 400, msg: "Bad Request"});
    const data = await db.query("INSERT INTO users (username, name, avatar_url) VALUES($1, $2, $3) RETURNING *;", [username, name, avatar_url]);
    return data.rows[0];
}

exports.deleteUserModel = async (username) => {
    await checkExists("users", "username", username);
    const userArticles = await db.query("SELECT * FROM articles WHERE author = $1", [username]);
    const articlePromises = userArticles.rows.map(article => {
        return deleteArticleModel(article.article_id);
    })
    await Promise.all(articlePromises);
    const userComments = await db.query("SELECT * FROM comments WHERE author = $1", [username]);
    const commentPromises = userComments.rows.map(comment => {
        return deleteCommentModel(comment.comment_id);
    })
    await Promise.all(commentPromises);
    return await db.query("DELETE FROM users WHERE username = $1;", [username]);
}