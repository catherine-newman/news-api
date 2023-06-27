const db = require("../connection");
const format = require("pg-format")

exports.checkExists = async (table, column, value) => {
    const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
    const data = await db.query(queryStr, [value]);
    if (!data.rows.length) {
        return Promise.reject({ status: 404, msg: "Not Found"});
    };
}