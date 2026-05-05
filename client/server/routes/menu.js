const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/restaurant/:restaurant_id", async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM menu_items
       WHERE restaurant_id = $1
       ORDER BY item_id ASC`,
      [restaurant_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
const result = await pool.query(
  "SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY item_id ASC",
);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;