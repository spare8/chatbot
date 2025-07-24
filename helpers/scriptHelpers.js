const fs = require('fs');
const path = require('path');
const {createVectorStore} = require('./openAI');
const hash = require('crypto').createHash('sha256');

const KNOWLEDGE_BANK_FOLDER_NAME = 'knowledgebank';
const VS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'VSConfig.json');

function isVSInConfig({VSName}) {
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    return false;
  }
  const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));
  return Boolean(config[VSName]);
}

async function createEmptyVS({VSName}) {
  try {
    const newVSId = await createVectorStore({VSName});
    // Write the new vector store ID to the config file
    const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));
    if (!config) {
      throw new Error('Failed to read VSConfig.json');
    }
    config[VSName] = {id: newVSId, files: {}};
    fs.writeFileSync(VS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`Vector store ${VSName} created with ID: ${newVSId}`);
  } catch (err) {
    throw new Error(`Failed to create vector store: ${err.message}`);
  }
}

function fileHash({fileName, VSName}) {
  const filePath = path.join(__dirname, '..', KNOWLEDGE_BANK_FOLDER_NAME, VSName, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  hash.update(fileContent);
  return hash.digest('hex');
}

module.exports = {
  isVSInConfig, createEmptyVS, fileHash,
};
