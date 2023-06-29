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

exports.insertUser = async (username, name, avatar_url) => {
    if (!username || !name || !avatar_url) return Promise.reject({ status: 400, msg: "Bad Request"});
    const data = await db.query("INSERT INTO users (username, name, avatar_url) VALUES($1, $2, $3) RETURNING *;", [username, name, avatar_url]);
    return data.rows[0];
}