function MockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    header: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
}

const applyCacheAndMock = (model) => {
  // List of methods we want to mock
  const methods = ['findOne', 'find', 'findOneAndUpdate', 'findById', 'countDocuments',
    'updateOne', 'create', 'updateMany', 'insertOne', 'exists', 'deleteMany', 'bulkWrite',
    'findByIdAndUpdate', 'findByIdAndDelete', 'aggregate', 'watch', 'distinct', 'deleteOne'];

  // List of chainable Mongoose methods that might follow the methods above
  const chainableMethods = ['sort', 'limit', 'select', 'skip', 'exec', 'cache'];

  methods.forEach((method) => {
    const originalMethod = model[method];

    model[method] = jest.fn(function(...args) {
      const result = originalMethod.apply(this, args);

      // Ensuring other methods are chainable
      chainableMethods.forEach((chainMethod) => {
        if (typeof result[chainMethod] !== 'function') {
          result[chainMethod] = jest.fn().mockReturnThis();
        }
      });

      return result;
    }.bind(model));
  });
};

module.exports = {
  MockResponse,
  applyCacheAndMock,
};
