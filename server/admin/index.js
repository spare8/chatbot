// server/index.js
const {ADMIN_SERVER_PORT, MONGODB_URI} = require('../../config/config.js');
const express = require('express');
const mongoose = require('mongoose');
const {applyErrorReporterMiddleware} = require('../../helpers/globalMiddlewares.js');

const app = express();

// parse JSON bodies
// app.use(express.json());

const router = express.Router();
router.use('/', require('./routes'));
app.use(router);

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

// applyErrorReporterMiddleware(app);
