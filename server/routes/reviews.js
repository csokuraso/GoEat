const express = require("express");
const router = express.Router();
const pool = require("../db");

// Получить отзывы
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        reviews.review_id,
        reviews.rating,
        reviews.comment,
        restaurants.restaurant_id,
        customers.customer_id,
        restaurants.name AS restaurant_name
      FROM reviews
      LEFT JOIN customers ON reviews.customer_id = customers.customer_id
      LEFT JOIN users ON customers.user_id = users.user_id
      LEFT JOIN restaurants ON reviews.restaurant_id = restaurants.restaurant_id
      LIMIT 6
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;