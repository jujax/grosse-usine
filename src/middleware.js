const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).send({ message: 'Token expired' });
    } else {
      res.status(401).send({ message: 'Unauthorized' });
    }
  }
};

const middleware = {
  jsonParser: express.json(),
  staticFiles: express.static(path.join(__dirname, '../dist')),
  authMiddleware,
};

module.exports = middleware;
