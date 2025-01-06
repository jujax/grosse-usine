const express = require('express');
const path = require('path');

const middleware = {
  jsonParser: express.json(),
  staticFiles: express.static(path.join(__dirname, '../dist')),
};

module.exports = middleware;
