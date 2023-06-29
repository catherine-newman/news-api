const { selectUsers, selectUser } = require("../models/users-model");

exports.getUsers = async (req, res, next) => {
    try {
        const data = await selectUsers();
        res.status(200).send({ users: data });
    } catch(err) {
        return next(err);
    }
}

exports.getUser = async (req, res, next) => {
    const { username } = req.params;
    try {
        const data = await selectUser(username);
        res.status(200).send({ user: data });
    } catch(err) {
        return next(err);
    }
}