require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const middleware = require('./middleware');
const pool = require('./db');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const App = require('../www/src/index').default;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(middleware.jsonParser);
app.use(middleware.staticFiles);

// Routes
app.use(routes);

// Serve React app for any unmatched routes
app.get('*', (req, res) => {
  const context = {};
  const appHtml = ReactDOMServer.renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Grosse Usine</title>
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on "http://localhost:${port}"`);
});
