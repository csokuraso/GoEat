const express = require("express");
const router = express.Router();
const pool = require("../db");

// Отримати всіх користувачів
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, role_id, username FROM users ORDER BY user_id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка на существование
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Цей логін уже зайнятий");
    }

    const result = await pool.query(
      `INSERT INTO users (username, password, role_id)
       VALUES ($1, $2, 3)
       RETURNING user_id, username, role_id`,
      [username, password]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `SELECT user_id, username, role_id
       FROM users
       WHERE username = $1 AND password = $2`,
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Невірний логін або пароль");
    }

    res.json(result.rows[0]);
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

router.post("/:user_id/address", async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.params;
    const { address_text } = req.body;

    if (!address_text) {
      return res.status(400).send("Адреса не вказана");
    }

    await client.query("BEGIN");

    const addressResult = await client.query(
      `INSERT INTO addresses (address_text)
       VALUES ($1)
       RETURNING address_id, address_text`,
      [address_text]
    );

    const address = addressResult.rows[0];

    const customerResult = await client.query(
  `INSERT INTO customers (user_id, address_id)
   VALUES ($1, $2)
   ON CONFLICT (user_id)
   DO UPDATE SET address_id = EXCLUDED.address_id
   RETURNING customer_id, user_id, address_id`,
  [user_id, address.address_id]
);

    await client.query("COMMIT");

    res.json({
      message: "Адресу збережено",
      address,
      customer: customerResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    client.release();
  }
});

module.exports = router;