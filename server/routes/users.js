const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT 
        users.user_id,
        users.username,
        users.role_id,
        roles.role_name
       FROM users
       LEFT JOIN roles ON users.role_id = roles.role_id
       WHERE users.user_id = $1`,
      [user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;