// __tests__/errorReporter.test.js

// 1️⃣ Mock out the ErrorLogs model and our utils helper
jest.mock('../../models/errorsSchema', () => ({
  create: jest.fn(),
}))
jest.mock('../../helpers/utils', () => ({
  isLocalEnv: jest.fn(),
}))

// 2️⃣ Now require the things under test
const ErrorLogs = require('../../models/errorsSchema')
const { isLocalEnv } = require('../../helpers/utils')
const { errorReporter } = require('../../helpers/errorReporter')  // ← adjust path if needed

describe('errorReporter()', () => {
  let logSpy
  const fakeErr = new Error('kaboom')
  fakeErr.stack = 'fake-stack'

  beforeEach(() => {
    jest.clearAllMocks()
    // intercept all console.log calls
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('should print to console when in local env', async () => {
    isLocalEnv.mockReturnValue(true)

    await errorReporter('MySource', fakeErr)

    // 8 console.log calls: the two lines of dashes, plus the 6 info lines
    expect(logSpy).toHaveBeenCalledTimes(8)

    expect(logSpy).toHaveBeenNthCalledWith(1, '------------------------------------\n')
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Error Ticket:')
    expect(logSpy).toHaveBeenNthCalledWith(3, 'Source: MySource')
    expect(logSpy).toHaveBeenNthCalledWith(4, 'Name: Error')
    expect(logSpy).toHaveBeenNthCalledWith(5, 'Message: kaboom')
    expect(logSpy).toHaveBeenNthCalledWith(6, 'Stack:')
    expect(logSpy).toHaveBeenNthCalledWith(7, 'fake-stack')
    expect(logSpy).toHaveBeenNthCalledWith(8, '------------------------------------\n')

    // and it should NOT hit the DB
    expect(ErrorLogs.create).not.toHaveBeenCalled()
  })

  it('should write to ErrorLogs.create when NOT in local env', async () => {
    isLocalEnv.mockReturnValue(false)

    await errorReporter('OtherSrc', fakeErr)

    // console should not be used
    expect(logSpy).not.toHaveBeenCalled()

    // DB create should be invoked exactly once with the right payload
    expect(ErrorLogs.create).toHaveBeenCalledTimes(1)
    expect(ErrorLogs.create).toHaveBeenCalledWith({
      source: 'OtherSrc',
      name: fakeErr.name,
      message: fakeErr.message,
      stack: fakeErr.stack,
    })
  })
})
