// helpers/configStatus.js
const {CONFIG_REQUIRED} = require('../config/constants');
const config = require('../config/config');

function getConfigStatus(env = config) {
  const missing = CONFIG_REQUIRED.filter((k) => !env[k]);
  return {ok: missing.length === 0, missing};
}

module.exports = {getConfigStatus};
