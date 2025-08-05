// server/index.js

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'), // <-- force the project-root .env
});
console.log(path.resolve(__dirname, '../../.env')); // <-- force the project-root .env

const express = require('express');
const mongoose = require('mongoose');
const {ADMIN_SERVER_PORT, MONGODB_URI} = require('../../config/config.js');
const {applyErrorReporterMiddleware} = require('../../helpers/globalMiddlewares.js');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use('/', routes);
applyErrorReporterMiddleware(app);

// --- connect to MongoDB ---
mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });

const PORT = ADMIN_SERVER_PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Express server running on http://localhost:${PORT}`),
);
