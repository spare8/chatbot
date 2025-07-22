/* eslint-disable no-process-env */
require('dotenv').config();

const config = {};

config.OPEN_AI_API_TOKEN = process.env.OPEN_AI_API_TOKEN;

module.exports = config;
