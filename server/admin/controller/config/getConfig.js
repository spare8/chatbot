// server/controller/envConfigRoutes.js
const fs = require('fs');
const path = require('path');
const envfile = require('envfile');

const ENV_PATH = path.resolve(process.cwd(), '.env');
const {CONFIG_WHITELIST} = require('../../../../config/constants');
const {mask} = require('../../../../helpers/utils');

// GET masked values
function getConfig(req, res) {
  const raw = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const parsed = envfile.parse(raw);
  const data = {};
  for (const k of CONFIG_WHITELIST) {
    data[k] = mask(k, parsed[k] ?? '');
  }
  res.json(data);
}
module.exports = {getConfig};
