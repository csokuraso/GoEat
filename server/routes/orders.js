const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      restaurant_id,
      address_id,
      payment_method_id,
      items,
    } = req.body;

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders 
       (customer_id, restaurant_id, address_id, payment_method_id, order_date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [customer_id, restaurant_id, address_id, payment_method_id]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, item_id, quantity)
         VALUES ($1, $2, $3)`,
        [order.order_id, item.item_id, item.quantity]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Замовлення створено",
      order_id: order.order_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    client.release();
  }
});

router.get("/", async (req, res) => {
  try {
 const result = await pool.query(`
  SELECT 
    orders.*,
    restaurants.name AS restaurant_name,
    payment_methods.method_name,
    deliveries.delivery_status,
    users.username AS courier_name
  FROM orders
  LEFT JOIN restaurants ON orders.restaurant_id = restaurants.restaurant_id
  LEFT JOIN payment_methods ON orders.payment_method_id = payment_methods.payment_method_id
  LEFT JOIN deliveries ON deliveries.order_id = orders.order_id
  LEFT JOIN couriers ON deliveries.courier_id = couriers.courier_id
  LEFT JOIN users ON couriers.user_id = users.user_id
  ORDER BY orders.order_date DESC
`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/:order_id/items", async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `SELECT 
        order_items.order_id,
        order_items.item_id,
        order_items.quantity,
        menu_items.name,
        menu_items.price
      FROM order_items
      LEFT JOIN menu_items ON order_items.item_id = menu_items.item_id
      WHERE order_items.order_id = $1`,
      [order_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;