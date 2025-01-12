require("dotenv").config();
const express = require("express");
const path = require("path");
const routes = require("./routes");
const middleware = require("./middleware");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(middleware.jsonParser);
app.use(middleware.staticFiles);

// Routes
app.use(routes);

// Serve React app for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on "http://localhost:${port}"`);
});
