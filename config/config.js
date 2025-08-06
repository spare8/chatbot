/* eslint-disable no-process-env */
require('dotenv').config();

const config = {};

config.NODE_ENV = process.env.NODE_ENV;

config.OPEN_AI_API_TOKEN = process.env.OPEN_AI_API_TOKEN;

config.MONGODB_URI = process.env.MONGODB_URI;

config.ADMIN_SERVER_PORT = process.env.ADMIN_SERVER_PORT;
config.SERVER_URL = process.env.SERVER_URL;
config.CLIENT_URL = process.env.CLIENT_URL;

config.AWS_REGION = process.env.AWS_REGION;
config.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
config.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
config.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;


module.exports = config;
