// helpers/ensureAdminToken.js
const fs = require('fs');
const path = require('path');
const envfile = require('envfile');
const crypto = require('crypto');
const config = require('../config/config');

const ENV_PATH = path.resolve(process.cwd(), '.env');

function ensureAdminToken() {
  const raw = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const parsed = envfile.parse(raw);

  // If present, load into runtime and return
  if (parsed.ADMIN_PANEL_TOKEN && parsed.ADMIN_PANEL_TOKEN.trim()) {
    config.ADMIN_PANEL_TOKEN = parsed.ADMIN_PANEL_TOKEN.trim();
    return parsed.ADMIN_PANEL_TOKEN;
  }

  // Generate strong token and persist
  const token = crypto.randomBytes(32).toString('base64url');
  parsed.ADMIN_PANEL_TOKEN = token;
  parsed.SERVER_URL = 'http://localhost:3000';
  parsed.CLIENT_URL = 'htpp://localhost:3001';
  fs.writeFileSync(ENV_PATH, envfile.stringify(parsed), 'utf8');
  config.ADMIN_PANEL_TOKEN = token;
  config.SERVER_URL = 'http://localhost:3000';
  config.CLIENT_URL = 'htpp://localhost:3001';
  console.log('🔐 Generated ADMIN_PANEL_TOKEN');
  return token;
}

module.exports = {ensureAdminToken};
