const { selectUsers } = require("../models/users-model");

exports.getUsers = async (req, res, next) => {
    try {
        const data = await selectUsers();
        res.status(200).send({ users: data });
    } catch(err) {
        return next(err);
    }
}