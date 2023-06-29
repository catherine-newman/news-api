const db = require("../db/connection");
const { checkExists } = require("./utils-model")

exports.deleteCommentModel = async (comment_id) => {
    await checkExists("comments", "comment_id", comment_id);
    return await db.query("DELETE FROM comments WHERE comment_id = $1;", [comment_id]);
}

exports.deleteArticleComments = async (article_id) => {
    return await db.query("DELETE FROM comments WHERE article_id = $1;", [article_id]);
}

exports.updateComment = async (comment_id, inc_votes) => {
    if (!inc_votes) return Promise.reject({ status: 400, msg: "Bad Request"});
    await checkExists("comments", "comment_id", comment_id);
    const data = await db.query("UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;", [inc_votes, comment_id]);
    return data.rows[0];
}