const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./db');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.appUser.findUnique({
      where: { email: username },
    });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ message: 'Login successful', token });
      } else {
        res.status(401).send({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.appUser.create({
      data: {
        email: username,
        password: hashedPassword,
      },
    });
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Test API route
router.get('/api', (req, res) => {
  res.send('Hello World!');
});

const middleware = require('./middleware');

router.get('/protected-route', middleware.authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;
