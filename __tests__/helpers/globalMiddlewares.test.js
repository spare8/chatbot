// __tests__/globalMiddlewares.test.js

// 1. Mock out the errorReporter so we can verify calls without side‐effects
jest.mock('../../helpers/errorReporter', () => ({
  errorReporter: jest.fn().mockResolvedValue(),
}));

const {errorReporter} = require('../../helpers/errorReporter');
const {applyErrorReporterMiddleware} = require('../../helpers/globalMiddlewares');

describe('globalMiddlewares', () => {
  let app; let handler1; let handler2;

  beforeEach(() => {
    handler1 = jest.fn().mockResolvedValue();
    handler2 = jest.fn().mockResolvedValue();

    // A fake express‐like app with:
    //  - two “route” entries (one direct, one nested under a router)
    //  - another stack entry to show it’s ignored
    app = {
      _router: {
        stack: [
          {
            // direct route
            route: {
              stack: [{handle: handler1}],
            },
          },
          {
            // nested router
            name: 'router',
            handle: {
              stack: [
                {
                  route: {
                    stack: [{handle: handler2}],
                  },
                },
              ],
            },
          },
          {
            // should be skipped
            name: 'other',
            handle: {},
          },
        ],
      },
      use: jest.fn(),
    };
  });

  it('wraps all route handlers in asyncHandler and registers the error middleware', () => {
    applyErrorReporterMiddleware(app);

    // Both original handlers must have been replaced
    const wrapped1 = app._router.stack[0].route.stack[0].handle;
    expect(wrapped1).not.toBe(handler1);

    const wrapped2 = app._router.stack[1].handle.stack[0]
        .route.stack[0].handle;
    expect(wrapped2).not.toBe(handler2);

    // And exactly one error‐handler was mounted at the end
    expect(app.use).toHaveBeenCalledTimes(1);
    const [[errMw]] = app.use.mock.calls;
    expect(errMw.name).toBe('errorReporterMiddleware');
    expect(errMw.length).toBe(4); // (error, req, res, next)
  });

  it('wrapped handlers call the original fn on success and do not call next()', async () => {
    applyErrorReporterMiddleware(app);
    const wrapped = app._router.stack[0].route.stack[0].handle;

    const req = {}; const res = {}; const next = jest.fn();
    await wrapped(req, res, next);

    expect(handler1).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('wrapped handlers catch Promise rejections and forward to next(error)', async () => {
    const boom = new Error('oops');
    handler1.mockReturnValueOnce(Promise.reject(boom));

    applyErrorReporterMiddleware(app);
    const wrapped = app._router.stack[0].route.stack[0].handle;

    const req = {}; const res = {}; const next = jest.fn();
    wrapped(req, res, next);
    // wait for the microtask queue to flush
    await new Promise(setImmediate);

    expect(next).toHaveBeenCalledWith(boom);
  });

  it('errorReporterMiddleware logs & returns 500 JSON on error', async () => {
    applyErrorReporterMiddleware(app);
    const [[errMw]] = app.use.mock.calls;

    const err = new Error('failure');
    const req = {baseUrl: '/api', path: '/endpoint'};
    const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    const next = jest.fn();

    await errMw(err, req, res, next);

    // must call into errorReporter with the concatenated source
    expect(errorReporter).toHaveBeenCalledWith('/api/endpoint', err);
    // and respond with a 500 + JSON
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({message: 'Something went wrong'});
    // never call next for this middleware
    expect(next).not.toHaveBeenCalled();
  });

  it('errorReporterMiddleware still responds 500 even if reporting itself fails', async () => {
    // force the reporter to reject:
    errorReporter.mockRejectedValueOnce(new Error('report‐fail'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    applyErrorReporterMiddleware(app);
    const [[errMw]] = app.use.mock.calls;

    const err = new Error('whoops');
    const req = {baseUrl: '/foo', path: '/bar'};
    const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    const next = jest.fn();

    await errMw(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(
        'Error during error reporting:',
        expect.any(Error),
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({message: 'Something went wrong'});
  });

  it('still registers errorReporterMiddleware when app._router is undefined', () => {
    // simulate no router present
    expect(() => applyErrorReporterMiddleware(app)).not.toThrow();

    // app.use should still be called once with the error handler
    expect(app.use).toHaveBeenCalledTimes(1);
    const [[errMw]] = app.use.mock.calls;
    expect(errMw.name).toBe('errorReporterMiddleware');
    expect(errMw.length).toBe(4);
  });

  it('still registers errorReporterMiddleware when app._router.stack is not an array', () => {
    // router exists but stack is garbage
    app._router = {stack: null};

    expect(() => applyErrorReporterMiddleware(app)).not.toThrow();

    expect(app.use).toHaveBeenCalledTimes(1);
    const [[errMw]] = app.use.mock.calls;
    expect(errMw.name).toBe('errorReporterMiddleware');
    expect(errMw.length).toBe(4);
  });
});
