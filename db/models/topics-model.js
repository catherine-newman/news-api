const db = require("../connection");

exports.selectTopics = async () => {
    const data = await db.query("SELECT slug, description FROM topics;");
    const result = data.rows[0];
    if (!result) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}