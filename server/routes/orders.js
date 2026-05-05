const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
  user_id,
  restaurant_id,
  payment_method_id,
  items,
} = req.body;

    await client.query("BEGIN");

    const customerResult = await client.query(
  `SELECT customer_id, address_id
   FROM customers
   WHERE user_id = $1`,
  [user_id]
);

if (customerResult.rows.length === 0) {
  throw new Error("Спочатку додайте адресу в профілі");
}

const customer_id = customerResult.rows[0].customer_id;
const address_id = customerResult.rows[0].address_id;

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

   await client.query(
  `INSERT INTO deliveries (order_id, delivery_status)
   VALUES ($1, 'created')`,
  [order.order_id]
);

await client.query(
  `UPDATE couriers
   SET is_available = false
   WHERE courier_id = (
     SELECT courier_id
     FROM deliveries
     WHERE order_id = $1
   )`,
  [order.order_id]
);

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
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).send("Не передано user_id");
    }

    const userResult = await pool.query(
      "SELECT role_id FROM users WHERE user_id = $1",
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Користувача не знайдено");
    }

    const role_id = userResult.rows[0].role_id;

    let query = `
      SELECT 
        orders.*,
        restaurants.name AS restaurant_name,
        payment_methods.method_name,
        deliveries.delivery_status,
        deliveries.courier_id,
        users.username AS courier_name
      FROM orders
      LEFT JOIN restaurants ON orders.restaurant_id = restaurants.restaurant_id
      LEFT JOIN payment_methods ON orders.payment_method_id = payment_methods.payment_method_id
      LEFT JOIN deliveries ON deliveries.order_id = orders.order_id
      LEFT JOIN couriers ON deliveries.courier_id = couriers.courier_id
      LEFT JOIN users ON couriers.user_id = users.user_id
    `;

    let result;

    if (role_id === 1) {
      result = await pool.query(query + " ORDER BY orders.order_date DESC");
    } else {
      result = await pool.query(
  query + `
    WHERE orders.customer_id IN (
      SELECT customer_id
      FROM customers
      WHERE user_id = $1
    )
    ORDER BY orders.order_date DESC
  `,
  [user_id]
);
    }

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

router.patch("/:order_id/status", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { delivery_status } = req.body;

    const result = await pool.query(
      `UPDATE deliveries
       SET delivery_status = $1
       WHERE order_id = $2
       RETURNING *`,
      [delivery_status, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Доставка для цього замовлення не знайдена");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.delete("/:order_id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_id } = req.params;

    await client.query("BEGIN");

    // если был назначен курьер — сделать его снова свободным
    await client.query(
      `UPDATE couriers
       SET is_available = true
       WHERE courier_id = (
         SELECT courier_id
         FROM deliveries
         WHERE order_id = $1
       )`,
      [order_id]
    );

    // удалить доставку
    await client.query(
      `DELETE FROM deliveries
       WHERE order_id = $1`,
      [order_id]
    );

    // удалить позиции заказа
    await client.query(
      `DELETE FROM order_items
       WHERE order_id = $1`,
      [order_id]
    );

    // удалить сам заказ
    await client.query(
      `DELETE FROM orders
       WHERE order_id = $1`,
      [order_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Замовлення видалено" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    client.release();
  }
});

router.delete("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      UPDATE couriers
      SET is_available = true
      WHERE courier_id IN (
        SELECT courier_id
        FROM deliveries
        WHERE courier_id IS NOT NULL
      )
    `);

    await client.query("DELETE FROM deliveries");
    await client.query("DELETE FROM order_items");
    await client.query("DELETE FROM orders");

    await client.query("COMMIT");

    res.json({ message: "Усі замовлення видалено" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    client.release();
  }
});

router.patch("/:order_id/order-status", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { order_status } = req.body;

    await pool.query(
      `SELECT update_order_status($1, $2)`,
      [order_id, order_status]
    );

    res.json({ message: "Статус замовлення оновлено" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;