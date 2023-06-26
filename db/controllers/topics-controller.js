const { selectTopics } = require("../models/topics-model");


exports.getTopics = async (req, res, next) => {
    try {
        const data = await selectTopics();
        res.status(200).send(data);
    } catch(err) {
        return next(err);
    }
}