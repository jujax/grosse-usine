const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.status(200).send({ message: 'Login successful' });
      } else {
        res.status(401).send({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  } finally {
    client.release();
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).send({ message: 'User registered successfully' });
  } finally {
    client.release();
  }
});

// Test API route
router.get('/api', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;
