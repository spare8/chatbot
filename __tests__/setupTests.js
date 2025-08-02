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

function applyCacheAndMock(model) {
  const methods = [
    'find',
    'findOne',
    'findById',
    'findOneAndUpdate',
    'findByIdAndUpdate',
    'create',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'countDocuments',
    'aggregate',
    'distinct',
  ];

  methods.forEach((m) => {
    // stub each to a jest.fn that resolves to undefined by default
    model[m] = jest.fn().mockResolvedValue(undefined);
  });
}

module.exports = {
  MockResponse,
  applyCacheAndMock,
};
