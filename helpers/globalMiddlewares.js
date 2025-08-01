const {errorReporter} = require('./errorReporter');

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
  const wrapRoutes = (stack) => {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Middleware with a route registered directly on the app
        middleware.route.stack.forEach((layer) => {
          layer.handle = asyncHandler(layer.handle);
        });
      } else if (middleware.name === 'router') {
        // For nested routers
        wrapRoutes(middleware.handle.stack);
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

module.exports = {applyErrorReporterMiddleware};
