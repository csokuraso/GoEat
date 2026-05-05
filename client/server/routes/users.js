const express = require("express");
const router = express.Router();
const pool = require("../db");

// 1. Получить всех пользователей
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT user_id, username, role_id FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// 2. ВХОД (Авторизация)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT user_id, username, role_id FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM($1)) AND TRIM(password) = TRIM($2)",
      [username, password]
    );

    if (result.rows.length > 0) {
      console.log("Успішний вхід:", result.rows[0].username);
      res.json(result.rows[0]);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// 3. РЕГИСТРАЦИЯ (ЕДИНЫЙ БЛОК)
router.post("/", async (req, res) => {
  const { username, password, role_id } = req.body;
  
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (role_id, username, password) 
       VALUES ($1, $2, $3) 
       RETURNING user_id, username, role_id`,
      [role_id || 2, username, password]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DATABASE ERROR:", err.message); 
    if (err.code === '23505') {
      res.status(400).send("User already exists");
    } else {
      res.status(500).send("Internal Server Error: " + err.message);
    }
  }
});

module.exports = router;