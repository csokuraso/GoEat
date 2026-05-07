const fs = require("fs/promises");
const path = require("path");
const pool = require("./db");

async function ensureDatabaseFunctions() {
  const sqlPath = path.join(__dirname, "sql", "database-functions.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);
}

module.exports = ensureDatabaseFunctions;