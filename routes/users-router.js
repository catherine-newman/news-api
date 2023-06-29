const usersRouter = require("express").Router();
const { getUsers, getUser, addUser } = require("../controllers/users-controller");

usersRouter
.route("/")
.get(getUsers)
.post(addUser);

usersRouter
.route("/:username")
.get(getUser);

module.exports = usersRouter;