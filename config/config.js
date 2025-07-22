/* eslint-disable no-process-env */

import dotenv from 'dotenv';

dotenv.config();

const config = {};

config.OPEN_AI_API_TOKEN = process.env.OPEN_AI_API_TOKEN;
console.log('Config loaded:', config);
export default config;
