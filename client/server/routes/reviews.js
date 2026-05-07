const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  try {
    const { customer_id, restaurant_id, courier_id, rating, comment } = req.body;

    const result = await pool.query(
      "SELECT * FROM create_review($1, $2, $3, $4, $5)",
      [customer_id, restaurant_id, courier_id, rating, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM get_reviews()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;