const fs = require('fs');
const path = require('path');
const {
  listVectorStores,
  searchVectorStoreFiles,
  listAllFiles,
} = require('../helpers/openAI');

const VS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'VSConfig.json');

function loadVSConfig() {
  if (!fs.existsSync(VS_CONFIG_PATH)) {
    console.error('VSConfig.json not found');
    return {};
  }

  try {
    const raw = fs.readFileSync(VS_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse VSConfig.json:', err.message);
    return {};
  }
}

async function validateVectorStores() {
  const config = await loadVSConfig();

  const configVSIds = new Set(Object.values(config).map((vs) => vs.id));
  const configFileIds = new Map();

  for (const [VSName, entry] of Object.entries(config)) {
    for (const [fileName, fileInfo] of Object.entries(entry.files || {})) {
      configFileIds.set(fileInfo.id, {VSName, fileName});
    }
  }

  const remote = await listVectorStores(100);
  if (!remote?.data) {
    console.error('Failed to fetch vector stores from OpenAI');
    return;
  }

  const remoteVSList = remote.data;
  const remoteVSIds = new Set();
  const remoteFilesInVS = new Set(); // Track files from vector stores

  for (const vs of remoteVSList) {
    remoteVSIds.add(vs.id);

    if (!configVSIds.has(vs.id)) {
      console.warn(`Vector store '${vs.id}' (name: '${vs.name}') is NOT in local config`);
    }

    const fileList = await searchVectorStoreFiles(vs.id);
    if (!fileList?.data) {
      console.warn(`Could not retrieve files for vector store '${vs.id}'`);
      continue;
    }

    for (const file of fileList.data) {
      remoteFilesInVS.add(file.id);
      if (!configFileIds.has(file.id)) {
        console.warn(`File '${file.id}' exists in OpenAI vector store '${vs.id}' but is not listed in config`);
      }
    }
  }

  for (const [VSName, entry] of Object.entries(config)) {
    if (!remoteVSIds.has(entry.id)) {
      console.warn(`Vector store '${VSName}' (id: '${entry.id}') exists in config but NOT on OpenAI`);
    }
  }

  // NEW: Check orphaned files that aren't in any vector store
  const allFiles = await listAllFiles();
  for (const file of allFiles) {
    if (!remoteFilesInVS.has(file.id)) {
      console.warn(`File '${file.id}' (name: '${
        file.filename}') exists in OpenAI but is not linked to any vector store`);
    }
  }

  console.log('\n Validation complete.');
}

if (require.main === module) {
  validateVectorStores().catch((err) => {
    console.error('Fatal error during validation:', err.message);
  });
}

module.exports = {
  validateVectorStores,
};
