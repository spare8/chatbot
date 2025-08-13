// server/controller/envConfigRoutes.js
const fs = require('fs');
const path = require('path');
const envfile = require('envfile');

const ENV_PATH = path.resolve(process.cwd(), '.env');
const {CONFIG_WHITELIST} = require('../../../../config/constants');
const config = require('../../../../config/config');

function updateConfig(req, res) {
  const incoming = req.body || {};
  const raw = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const current = envfile.parse(raw);
  const next = {...current};
  // Only apply keys that are actually provided and non-empty
  for (const k of CONFIG_WHITELIST) {
    if (k === 'ADMIN_PANEL_TOKEN') {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(incoming, k)) {
      const v = incoming[k];
      if (v !== undefined && v !== '') {
        next[k] = v;
      }
    }
  }

  // backup
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '');
  if (raw) {
    fs.writeFileSync(`${ENV_PATH}.${ts}.bak`, raw, 'utf8');
  }

  // write
  fs.writeFileSync(ENV_PATH, envfile.stringify(next), 'utf8');

  // refresh runtime
  for (const k of CONFIG_WHITELIST) {
    if (next[k] !== undefined) {
      config[k] = next[k];
    }
  }

  res.json({ok: true, message: '.env saved', restartRecommended: true});
}

module.exports = {updateConfig};
