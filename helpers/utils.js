const {NODE_ENV} = require('../config/config');
const {SECRET_PATTERNS} = require('../config/constants');

const utils = {};

const isDevEnv = () => NODE_ENV === 'development';
const isDevOrLocal = () => ['development', 'local'].includes(NODE_ENV);
utils.isDevOrLocal = isDevOrLocal;
utils.isDevEnv = isDevEnv;
utils.isLocalEnv = () => NODE_ENV === 'local';
utils.isProdEnv = () => NODE_ENV === 'production';


utils.mask = (k, v) => {
  if (!v) {
    return '';
  }
  return SECRET_PATTERNS.some((rx) => rx.test(k)) ?
    `${String(v).slice(0, 3)}…${String(v).slice(-6)}` :
    v;
};

utils.pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]).filter(([, v]) => v !== undefined));

module.exports = utils;
