const usersRouter = require("express").Router();
const { getUsers, getUser, addUser, deleteUser } = require("../controllers/users-controller");

usersRouter
.route("/")
.get(getUsers)
.post(addUser);

usersRouter
.route("/:username")
.get(getUser)
.delete(deleteUser);

module.exports = usersRouter;