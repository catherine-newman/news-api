const { selectUsers, selectUser, insertUser, deleteUserModel } = require("../models/users-model");

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

exports.addUser = async (req, res, next) => {
    const { username, name, avatar_url } = req.body;
    try {
        const data = await insertUser(username, name, avatar_url);
        res.status(201).send({ user: data });
    } catch(err) {
        return next(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    const { username } = req.params;
    try {
        await deleteUserModel(username);
        res.status(204).send();
    } catch(err) {
        return next(err);
    }
}