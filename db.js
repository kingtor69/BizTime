/** Database setup for BizTime. */
// all code by Tor Kingdon

const { Client } = require("pg");

let DB_URI = `postgres://postgres:${process.env.PSQL}@localhost:5432/biztime`;

if (process.env.NODE_ENV === "test") {
  DB_URI += "_test";
};

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;