/* eslint-disable no-process-env */
require('dotenv').config();

const config = {};

config.NODE_ENV = 'local';
config.ADMIN_PANEL_TOKEN = process.env.ADMIN_PANEL_TOKEN;
config.SERVER_URL = 'http://localhost:3000';
config.CLIENT_URL = 'http://localhost:3001';

config.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

config.MONGODB_URI = process.env.MONGODB_URI;


config.AWS_REGION = process.env.AWS_REGION;
config.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
config.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
config.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;


module.exports = config;
