module.exports = {
  "clearMocks": true,
  "collectCoverage": true,
  "collectCoverageFrom": [
    "<rootDir>/__tests__/server/admin/controller/modifyAssistant.test.js",
    "<rootDir>/helpers/openAI.js",
    "<rootDir>/models/assistant.js",
    "<rootDir>/models/vectorStore.js",
    "<rootDir>/pages/admin/vector-stores/index.js"
  ],
  "coverageDirectory": "coverage",
  "coveragePathIgnorePatterns": [
    "/models/.*\\.js$",
    "/*/routes.js$"
  ],
  "coverageProvider": "v8",
  "coverageReporters": [
    "json-summary",
    "text"
  ],
  "maxWorkers": "50%",
  "rootDir": "../",
  "setupFilesAfterEnv": [
    "<rootDir>/config/jest.setup.js"
  ],
  "testEnvironment": "node",
  "testPathIgnorePatterns": [
    "<rootDir>/__tests__/setupTests.js",
    "<rootDir>/__tests__/testUtils.js"
  ]
};