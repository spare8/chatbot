// server/index.js
const {ADMIN_SERVER_PORT, MONGODB_URI} = require('../../config/config.js');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// parse JSON bodies
app.use(express.json());

// --- connect to MongoDB ---
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- simple test route ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// TODO: mount your chatbot-management routes here

const PORT = ADMIN_SERVER_PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Express server running on http://localhost:${PORT}`)
);
