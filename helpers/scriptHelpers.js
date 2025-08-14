const fs = require('fs');
const path = require('path');
const {createVectorStore, deleteFileById, deleteFileFromVectorStore, addFileToVectorStore,
  uploadFileToOpenAI, deleteVectorStore} = require('./openAI');
const crypto = require('crypto');// this is used to randomise

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
  const hash = crypto.createHash('sha256');
  hash.update(fileContent);
  return hash.digest('hex');
}

function isFileInVSConfig({fileName, VSName}) {
  const filePath = path.join(__dirname, '..', KNOWLEDGE_BANK_FOLDER_NAME, VSName, fileName);
  return Boolean(fs.existsSync(filePath));
}


function isFileHashMatch({fileName, VSName, currentHash}) {
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));
    const storedHash = config?.[VSName]?.files?.[fileName]?.hash;

    return storedHash === currentHash;
  } catch (err) {
    console.error(`Error reading VSConfig.json: ${err.message}`);
    return false;
  }
}

async function deleteFile({fileName, VSName}) {
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    throw new Error('VSConfig.json does not exist');
  }

  const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));

  const vectorStore = config?.[VSName];
  if (!vectorStore) {
    throw new Error(`Vector store '${VSName}' not found in config.`);
  }

  const fileEntry = vectorStore.files?.[fileName];
  if (!fileEntry) {
    throw new Error(`File '${fileName}' not found in vector store '${VSName}' config.`);
  }

  const {id: fileId} = fileEntry;
  const vectorStoreId = vectorStore.id;

  try {
    // Step 1: Remove from vector store
    await deleteFileFromVectorStore({fileId, vectorStoreId});

    // Step 2: Remove from OpenAI's file system
    await deleteFileById(fileId);

    // Step 3: Remove from local config
    delete config[VSName].files[fileName];
    fs.writeFileSync(VS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    console.log(`Successfully deleted '${fileName}' from '${VSName}' vector store and OpenAI.`);
  } catch (err) {
    console.error(`Failed to delete '${fileName}': ${err.message}`);
    throw err;
  }
}


async function addFile({fileName, VSName}) {
  // Load config
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    throw new Error('VSConfig.json not found');
  }
  const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));

  // Check VS exists
  if (!config[VSName]) {
    throw new Error(`Vector store '${VSName}' not found in config. Create it with createEmptyVS()`);
  }

  const vectorStoreId = config[VSName].id;

  // Calculate file hash
  const currentHash = fileHash({fileName, VSName});

  // Check if file already exists with same hash
  const existingEntry = config[VSName].files?.[fileName];
  if (existingEntry && existingEntry.hash === currentHash) {
    console.log(`${fileName} already exists in '${VSName}' with same content. Skipping.`);
    return;
  }
  // Upload file to OpenAI
  const filePath = path.join(__dirname, '..', KNOWLEDGE_BANK_FOLDER_NAME, VSName, fileName);
  const uploadResponse = await uploadFileToOpenAI(filePath);
  if (!uploadResponse?.id) {
    throw new Error(`Failed to upload '${fileName}' to OpenAI.`);
  }
  const fileId = uploadResponse.id;
  console.log(`Uploaded '${fileName}' to OpenAI with ID: ${fileId}`);
  // Add file to vector store
  const vsResponse = await addFileToVectorStore({fileId, vectorStoreId});
  if (vsResponse?.error) {
    throw new Error(`Failed to add '${fileName}' to vector store '${VSName}': ${vsResponse.error}`);
  }
  if (!vsResponse) {
    throw new Error(`Failed to add '${fileName}' to vector store '${VSName}'.`);
  }

  // Ensure files object exists
  if (!config[VSName].files) {
    config[VSName].files = {};
  }

  // Update config
  config[VSName].files[fileName] = {
    id: fileId,
    hash: currentHash,
  };

  fs.writeFileSync(VS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`Successfully added '${fileName}' to vector store '${VSName}'`);
}

function getVectorStoreFolderNames() {
  if (!fs.existsSync(KNOWLEDGE_BANK_FOLDER_NAME)) {
    return [];
  }

  return fs.readdirSync(KNOWLEDGE_BANK_FOLDER_NAME).filter((folder) => {
    const fullPath = path.join(KNOWLEDGE_BANK_FOLDER_NAME, folder);
    return fs.lstatSync(fullPath).isDirectory();
  });
}

async function deleteMissingVectorStoresFromConfig() {
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    return;
  }

  const configRaw = fs.readFileSync(VS_CONFIG_PATH, 'utf-8');
  const config = JSON.parse(configRaw);
  const folderNames = new Set(getVectorStoreFolderNames());

  let changed = false;

  for (const VSName of Object.keys(config)) {
    if (!folderNames.has(VSName)) {
      const vsId = config[VSName]?.id;
      if (!vsId) {
        console.warn(`⚠️ Skipping '${VSName}' — missing ID`);
        continue;
      }

      try {
        console.log(`🧹 Deleting orphaned vector store '${VSName}'...`);
        await deleteVectorStore(vsId);
        delete config[VSName];
        changed = true;
        console.log(`✅ Deleted '${VSName}' from OpenAI and config`);
      } catch (err) {
        console.error(`❌ Failed to delete '${VSName}': ${err.message}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(VS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  }
}


module.exports = {
  isVSInConfig, createEmptyVS, fileHash, isFileInVSConfig, isFileHashMatch, deleteFile, addFile,
  getVectorStoreFolderNames, deleteMissingVectorStoresFromConfig,
};
