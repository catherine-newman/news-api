const db = require("../db/connection");

exports.selectUsers = async () => {
    const data = await db.query("SELECT username, name, avatar_url FROM users;");
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows;
}

exports.selectUser = async (username) => {
    const data = await db.query("SELECT username, name, avatar_url FROM users WHERE username = $1;", [username]);
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    }
    return data.rows[0];
}