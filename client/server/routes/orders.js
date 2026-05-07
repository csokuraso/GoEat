const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  try {
    const { user_id, restaurant_id, payment_method_id, items } = req.body;

    const result = await pool.query(
      "SELECT * FROM create_order_from_cart($1, $2, $3, $4::jsonb)",
      [user_id, restaurant_id, payment_method_id, JSON.stringify(items)]
    );
    const order = result.rows[0];

    res.json({
      message: "Замовлення створено",
      order_id: order.order_id,
    });
  } catch (err) {
    console.error(err);
    const validationMessages = [
      "Спочатку додайте адресу в профілі",
      "Кошик порожній",
    ];
    const status = validationMessages.some((message) => err.message.includes(message))
      ? 400
      : 500;
    res.status(status).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).send("Не передано user_id");
    }

    const result = await pool.query("SELECT * FROM get_orders_for_user($1)", [
      user_id,
    ]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/:order_id/items", async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query("SELECT * FROM get_order_items($1)", [
      order_id,
    ]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.patch("/:order_id/status", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { delivery_status } = req.body;

    const result = await pool.query(
      "SELECT manage_order_action('update_delivery_status', $1, $2) AS result",
      [order_id, delivery_status]
    );

    res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Доставка для цього замовлення не знайдена")
      ? 404
      : 500;
    res.status(status).send(err.message);
  }
});

router.delete("/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      "SELECT manage_order_action('delete_order', $1, NULL) AS result",
      [order_id]
    );

    res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT manage_order_action('delete_all_orders', NULL, NULL) AS result"
    );

    res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.patch("/:order_id/order-status", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { order_status } = req.body;

    const result = await pool.query(
      "SELECT manage_order_action('update_order_status', $1, $2) AS result",
      [order_id, order_status]
    );

    res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Замовлення не знайдено") ? 404 : 500;
    res.status(status).send(err.message);
  }
});

module.exports = router;