const {NODE_ENV} = require('../config/config.js');

const utils = {};

const isDevEnv = () => NODE_ENV === 'development';
const isDevOrLocal = () => ['development', 'local'].includes(NODE_ENV);
utils.isDevOrLocal = isDevOrLocal;
utils.isDevEnv = isDevEnv;
utils.isLocalEnv = () => NODE_ENV === 'local';
utils.isProdEnv = () => NODE_ENV === 'production';

module.exports = utils;
