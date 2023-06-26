const endpoints = require("../../endpoints.json");

exports.getEndpoints = async (req, res, next) => {
    res.status(200).send({ endpoints : endpoints });
}