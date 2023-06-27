const db = require("../connection");

exports.selectUsers = async () => {
    const data = await db.query("SELECT username, name, avatar_url FROM users;");
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}