const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  try {
    const { customer_id, restaurant_id, courier_id, rating, comment } = req.body;

    const result = await pool.query(
      `INSERT INTO reviews 
       (customer_id, restaurant_id, courier_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
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
    const result = await pool.query(`
      SELECT 
        reviews.*,
        users.username
      FROM reviews
      LEFT JOIN customers ON reviews.customer_id = customers.customer_id
      LEFT JOIN users ON customers.user_id = users.user_id
      ORDER BY reviews.review_id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;