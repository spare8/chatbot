const {LOGGING_COLORS} = require('../config/constants');
const config = require('../config/config');

function verifyConfig() {
  for (const [key, value] of Object.entries(config)) {
    if ((value === undefined) || (value === null)) {
      throw Error(`\x1b[31mMissing env var for ${key}\x1b[0m`);
    }
  }
  console.log(LOGGING_COLORS.GREEN, `Environment File is Valid!`);
}

module.exports = {verifyConfig};
