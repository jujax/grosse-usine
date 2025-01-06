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
  const verificationToken = crypto.randomBytes(32).toString('hex');
  try {
    const user = await prisma.appUser.create({
      data: {
        email: username,
        password: hashedPassword,
        isEmailVerified: false,
      },
    });

    await redisClient.set(`verificationToken:${verificationToken}`, user.id, {
      EX: 60 * 60 * 24, // 24 hours expiration
    });

    const verificationLink = `http://localhost:8080/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: ${verificationLink}`,
    });

    res.status(201).send({ message: 'User registered successfully. Please check your email for verification link.' });
  } catch (error) {
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
