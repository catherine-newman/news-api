const { deleteCommentModel } = require("../models/comments-model")

exports.deleteComment = async (req, res, next) => {
    const { comment_id } = req.params;
    try {
        await deleteCommentModel(comment_id);
        res.status(204).send();
    } catch(err) {
        return next(err);
    }
}