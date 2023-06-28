const usersRouter = require("express").Router();
const { getUsers, getUser } = require("../controllers/users-controller");

usersRouter
.route("/")
.get(getUsers);

usersRouter
.route("/:username")
.get(getUser);

module.exports = usersRouter;