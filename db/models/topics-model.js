const db = require("../connection");

exports.selectTopics = async () => {
    const data = await db.query("SELECT slug, description FROM topics;");
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}

exports.insertTopic = async (slug, description) => {
    if (!slug || !description) return Promise.reject({ status: 400, msg: "Bad Request"});
    const data = await db.query("INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;", [slug, description]);
    return data.rows[0];
}