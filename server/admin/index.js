// server/index.js


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {MONGODB_URI, CLIENT_URL} = require('../../config/config.js');
const {applyErrorReporterMiddleware, restrictToFrontendMiddleware,
  setUpRequiredMiddleware} = require('../../helpers/middlewares');
const routes = require('./routes');
const configRoutes = require('./configRoutes');
const {getConfigStatus} = require('../../helpers/configStatus');

const {ensureAdminToken} = require('../../helpers/ensureAdminToken');
ensureAdminToken();

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));


app.use(express.json());
app.use('/config', restrictToFrontendMiddleware, configRoutes);
app.use('/', setUpRequiredMiddleware, routes);
applyErrorReporterMiddleware(app);

// --- connect to MongoDB ---
const {ok} = getConfigStatus();
if (ok) {
  mongoose
      .connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => console.log('✅ MongoDB connected'))
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        /* eslint-disable no-process-exit */
        process.exit(1);
      });
} else {
  console.warn('⚠️  Server started in SETUP MODE (DB not connected).');
}

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Express server running on http://localhost:${PORT}`),
);
