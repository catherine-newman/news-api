const { deleteCommentModel, updateComment } = require("../models/comments-model")

exports.deleteComment = async (req, res, next) => {
    const { comment_id } = req.params;
    try {
        await deleteCommentModel(comment_id);
        res.status(204).send();
    } catch(err) {
        return next(err);
    }
}

exports.patchComment = async (req, res, next) => {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;
    try {
        const data = await updateComment(comment_id, inc_votes);
        res.status(200).send({ comment : data });
    } catch(err) {
        return next(err);
    }
}