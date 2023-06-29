const express = require("express");
const apiRouter = require("./routes/api-router");
const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
    res.status(404).send({ status: 404, msg: "Not Found"});
})

app.use((err, req, res, next) => {
    if (err.code === "22P02" || err.code === "23505") {
        res.status(400).send({ msg: "Bad Request" });
    }
    if (err.code === "23503") {
        res.status(401).send({ msg: "Unauthorized" });
    }
    return next(err);
});

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    }
    return next(err);
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal Server Error' });
    console.log(err)
});

module.exports = app;