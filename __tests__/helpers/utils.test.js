// __tests__/utils.test.js
describe('environment utils', () => {
  const CONFIG_PATH = '../../config/config.js'
  const UTILS_PATH  = '../../helpers/utils.js'

  afterEach(() => {
    // Clear both Jest’s module registry and any mocks
    jest.resetModules()
    jest.clearAllMocks()
  })

  const cases = [
    {
      env: 'development',
      expected: {
        isDevEnv:     true,
        isDevOrLocal: true,
        isLocalEnv:   false,
        isProdEnv:    false,
      },
    },
    {
      env: 'local',
      expected: {
        isDevEnv:     false,
        isDevOrLocal: true,
        isLocalEnv:   true,
        isProdEnv:    false,
      },
    },
    {
      env: 'production',
      expected: {
        isDevEnv:     false,
        isDevOrLocal: false,
        isLocalEnv:   false,
        isProdEnv:    true,
      },
    },
    {
      env: 'test', // anything else
      expected: {
        isDevEnv:     false,
        isDevOrLocal: false,
        isLocalEnv:   false,
        isProdEnv:    false,
      },
    },
  ]

  cases.forEach(({ env, expected }) => {
    it(`when NODE_ENV="${env}"`, () => {
      // 1. Mock config/config.js to export NODE_ENV=env
      jest.doMock(CONFIG_PATH, () => ({ NODE_ENV: env }), { virtual: true })

      // 2. Require utils *after* the mock
      const utils = require(UTILS_PATH)

      // 3. Assert each helper
      expect(utils.isDevEnv()).toBe(    expected.isDevEnv)
      expect(utils.isDevOrLocal()).toBe(expected.isDevOrLocal)
      expect(utils.isLocalEnv()).toBe(  expected.isLocalEnv)
      expect(utils.isProdEnv()).toBe(   expected.isProdEnv)
    })
  })
})
