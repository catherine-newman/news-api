const { selectTopics, insertTopic } = require("../models/topics-model");


exports.getTopics = async (req, res, next) => {
    try {
        const data = await selectTopics();
        res.status(200).send({ topics: data });
    } catch(err) {
        return next(err);
    }
}

exports.postTopic = async (req, res, next) => {
    const { slug, description } = req.body;
    try {
        const data = await insertTopic(slug, description);
        res.status(201).send({ topic: data });
    } catch(err) {
        return next(err);
    }
}