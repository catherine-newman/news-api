const db = require("../connection");
const { checkExists } = require("./utils-model")

exports.deleteCommentModel = async (comment_id) => {
    await checkExists("comments", "comment_id", comment_id);
    return await db.query("DELETE FROM comments WHERE comment_id = $1;", [comment_id]);
}