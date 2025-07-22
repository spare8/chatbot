/* eslint-disable no-process-env */

require('dotenv').config();

const config = {};

config.OPEN_API_ACCESS_KEY = process.env.OPEN_API_ACCESS_KEY;

module.exports = config;
