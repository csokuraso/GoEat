const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET users
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

// POST user
router.post("/", async (req, res) => {
  try {
    const { username } = req.body;

  const result = await pool.query(
  `INSERT INTO users (role_id, username)
   VALUES ($1, $2)
   RETURNING *`,
  [1, req.body.username]
);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;