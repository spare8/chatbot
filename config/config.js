/* eslint-disable no-process-env */
require('dotenv').config();

const config = {};

config.OPEN_AI_API_TOKEN = process.env.OPEN_AI_API_TOKEN;
config.MONGODB_URI = process.env.MONGODB_URI;
config.ADMIN_SERVER_PORT = process.env.ADMIN_SERVER_PORT;
config.NODE_ENV = process.env.NODE_ENV;
config.SERVER_URL = process.env.SERVER_URL;


module.exports = config;
