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

    const result = await pool.query(
      "SELECT * FROM upsert_user_profile(NULL, $1, $2, true)",
      [username, password]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Цей логін уже зайнятий") ? 400 : 500;
    res.status(status).send(status === 400 ? err.message : "Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query("SELECT * FROM authenticate_user($1, $2)", [
      username,
      password,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).send("Невірний логін або пароль");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/:user_id/address", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query("SELECT * FROM get_user_address($1)", [user_id]);

    if (result.rows.length === 0) {
      return res.json({ address_text: "" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.post("/:user_id/address", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { address_text } = req.body;

    const result = await pool.query("SELECT * FROM save_user_address($1, $2)", [
      user_id,
      address_text,
    ]);
    const savedAddress = result.rows[0];

    res.json({
      message: "Адресу збережено",
      address: {
        address_id: savedAddress.address_id,
        address_text: savedAddress.address_text,
      },
      customer: {
        customer_id: savedAddress.customer_id,
        user_id: savedAddress.user_id,
        address_id: savedAddress.address_id,
      },
    });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Адреса не вказана") ? 400 : 500;
    res.status(status).send(err.message);
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

router.patch("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { username } = req.body;

    const result = await pool.query(
      "SELECT * FROM upsert_user_profile($1, $2, NULL, false)",
      [user_id, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Користувача не знайдено");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Ім'я не вказано") ? 400 : 500;
    res.status(status).send(err.message);
  }
});

router.patch("/:user_id/profile", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM upsert_user_profile($1, $2, $3, false)",
      [user_id, username, password]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Користувача не знайдено");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Ім'я не вказано") ? 400 : 500;
    res.status(status).send(err.message);
  }
});

module.exports = router;