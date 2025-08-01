const ErrorLogs = require('../models/errorsSchema');
const {isLocalEnv} = require('./utils');

async function errorReporter(source, err) {
  if (isLocalEnv()) {
    console.log(`------------------------------------\n`);
    console.log(`Error Ticket:`);
    console.log(`Source: ${source}`);
    console.log(`Name: ${err.name}`);
    console.log(`Message: ${err.message}`);
    console.log(`Stack:`);
    console.log(err.stack);
    console.log(`------------------------------------\n`);
  } else {
    const errLog = {
      source: source,
      name: err.name,
      message: err.message,
      stack: err.stack};
    await ErrorLogs.create(errLog);
  }
}

module.exports = {errorReporter};
