const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;

// Global Mocks
jest.mock('../helpers/errorReporter', () => ({
  errorReporter: jest.fn(),
}));

expect.extend({
  toBeObjectId(received) {
    const pass = ObjectId.isValid(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },
});

function MockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    header: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
}

/**
 * Given a Mongoose model, stubs out its methods so you can write tests
 * without hitting the real database. Query methods return a chainable
 * object with .populate() and .exec().
 */
function applyCacheAndMock(model) {
  // Which methods should return a chainable query
  const queryMethods = [
    'find',
    'findOne',
    'findById',
    'findOneAndUpdate',
    'findByIdAndUpdate',
  ];

  // Which methods just return a promise of “something”
  const simplePromiseMethods = [
    'create',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'countDocuments',
    'aggregate',
    'distinct',
  ];

  // Build one shared chainable stub
  function makeChainable(defaultResult = []) {
    const chain = {};
    chain.populate = jest.fn(() => chain);
    chain.exec = jest.fn().mockResolvedValue(defaultResult);
    return chain;
  }

  // Stub out the query methods
  for (const m of queryMethods) {
    model[m] = jest.fn(() => makeChainable());
  }

  // Stub out simple promise methods
  for (const m of simplePromiseMethods) {
    model[m] = jest.fn().mockResolvedValue(undefined);
  }
}

module.exports = {
  MockResponse,
  applyCacheAndMock,
};
