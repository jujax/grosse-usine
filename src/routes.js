const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { createClient } = require('redis');

const router = express.Router();

// Redis setup
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().catch(err => {
  console.error('Failed to connect to Redis', err);
  process.exit(1);
});

// Email verification setup
const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.appUser.findUnique({
      where: { email: username },
    });
    if (user) {
      if (!user.isEmailVerified) {
        return res.status(401).send({ message: 'Email not verified' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ message: 'Login successful', token });
      } else {
        res.status(401).send({ message: 'Invalid credentials' });
        console.log('Invalid credentials attempt for user:', req.body.username);
      }
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
      console.log('Invalid credentials attempt for user:', req.body.username);
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register attempt for user:', username);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    console.log('Invalid email format for user:', username);
    return res.status(400).send({ message: 'Invalid email format' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  try {
    const user = await prisma.appUser.create({
      data: {
        email: username,
        password: hashedPassword,
        isEmailVerified: false,
      },
    });
    console.log('User created with ID:', user.id);

    await redisClient.set(`verificationToken:${verificationToken}`, user.id, {
      EX: 60 * 60 * 24, // 24 hours expiration
    });
    console.log('Verification token set for user:', user.id);

    const verificationLink = `http://localhost:8080/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: ${verificationLink}`,
    });

    res.status(201).send({ message: 'User registered successfully. Please check your email for verification link.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Verify email route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const userId = await redisClient.get(`verificationToken:${token}`);
    if (userId) {
      await prisma.appUser.update({
        where: { id: parseInt(userId, 10) },
        data: { isEmailVerified: true },
      });
      await redisClient.del(`verificationToken:${token}`);
      res.status(200).send({ message: 'Email verified successfully' });
    } else {
      res.status(400).send({ message: 'Invalid or expired verification token' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Resend verification email route
router.post('/resend-verification-email', async (req, res) => {
  const { username } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  try {
    const user = await prisma.appUser.findUnique({
      where: { email: username },
    });
    if (user) {
      if (user.isEmailVerified) {
        return res.status(400).send({ message: 'Email is already verified' });
      }
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await redisClient.set(`verificationToken:${verificationToken}`, user.id, {
        EX: 60 * 60 * 24, // 24 hours expiration
      });

      const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: username,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link: ${verificationLink}`,
      });

      res.status(200).send({ message: 'Verification email resent. Please check your email for verification link.' });
    } else {
      res.status(400).send({ message: 'User not found' });
    }
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
