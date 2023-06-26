const db = require("../connection");

exports.selectTopics = async () => {
    const data = await db.query("SELECT slug, description FROM topics;");
    return data.rows;
}