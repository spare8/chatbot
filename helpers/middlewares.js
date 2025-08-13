const {errorReporter} = require('./errorReporter');
const {getConfigStatus} = require('./configStatus');
const {ADMIN_PANEL_TOKEN, CLIENT_URL} = require('../config/config');

// Error reporting middleware
// eslint-disable-next-line no-unused-vars
const errorReporterMiddleware = async (error, req, res, next) => {
  try {
    const source = `${req.baseUrl}${req.path}`;
    await errorReporter(source, error);
  } catch (reportingError) {
    console.error('Error during error reporting:', reportingError);
  }
  return res.status(500).json({message: 'Something went wrong'});
};

// Function to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const applyAsyncHandlerGlobally = (app) => {
  if (!app._router || !Array.isArray(app._router.stack)) {
    // nothing to wrap
    return;
  }

  const wrapRoutes = (stack) => {
    stack.forEach((layer) => {
      if (layer.route) {
        layer.route.stack.forEach((l) => {
          l.handle = asyncHandler(l.handle);
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        wrapRoutes(layer.handle.stack);
      }
    });
  };

  wrapRoutes(app._router.stack);
};

// Use this Middleware last
const applyErrorReporterMiddleware = (app) => {
  // Apply async handler wrapper after all routes are registered
  applyAsyncHandlerGlobally(app);
  // Apply error reporting middleware last to catch all errors
  app.use(errorReporterMiddleware);
};

// middleware: after-setup auth
function adminAuth(req, res, next) {
  const {ok} = getConfigStatus();
  if (!ok) {
    return next();
  } // allow bootstrap mode; further checks below
  const token = req.header('x-admin-token');
  if (!token || token !== ADMIN_PANEL_TOKEN) {
    return res.status(401).json({error: 'Unauthorized'});
  }
  return next();
}

// middleware: in bootstrap mode, only allow localhost and POST to set env
function bootstrapGuard(req, res, next) {
  const {ok} = getConfigStatus();
  if (ok) {
    return next();
  }
  // allow only localhost setup
  const ip = req.ip || req.connection?.remoteAddress || '';
  const isLocal = ['127.0.0.1', '::1'].some((v) => ip.includes(v));
  if (!isLocal) {
    return res.status(403).json({error: 'Forbidden (setup mode)'});
  }

  // In setup mode:
  // - GET is allowed but returns masked/defaults
  // - POST allowed to write initial .env
  return next();
}

// helpers/middlewares.js
function restrictToFrontendMiddleware(req, res, next) {
  const allowed = CLIENT_URL;
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const internal = req.headers['x-internal-proxy'] === 'next';

  // loopback checks
  const ip = req.ip || req.connection?.remoteAddress || '';
  const isLocal = ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('::ffff:127.0.0.1');

  if (internal || isLocal) {
    return next();
  }
  if ((origin && origin === allowed) || (referer && referer.startsWith(allowed))) {
    return next();
  }
  return res.status(403).json({error: 'Forbidden'});
}


function setUpRequiredMiddleware(req, res, next) {
  // Allow config endpoints above and health checks to pass
  if (req.path.startsWith('/config')) {
    return next();
  }
  const {ok, missing} = getConfigStatus();
  if (!ok) {
    return res.status(503).json({
      error: 'Setup required',
      missing,
    });
  }
  return next();
}

module.exports = {applyErrorReporterMiddleware, adminAuth, bootstrapGuard,
  restrictToFrontendMiddleware, setUpRequiredMiddleware};
