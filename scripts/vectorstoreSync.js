
const fs = require('fs');
const path = require('path');
const {
  isVSInConfig,
  createEmptyVS,
  fileHash,
  isFileHashMatch,
  deleteFile,
  addFile,
  deleteMissingVectorStoresFromConfig,
  getVectorStoreFolderNames,
} = require('../helpers/scriptHelpers');

// Constants
const KNOWLEDGE_BANK_FOLDER_NAME = 'knowledgebank';
const KB_PATH = path.join(__dirname, '..', KNOWLEDGE_BANK_FOLDER_NAME);
const VS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'VSConfig.json');

/**
 * Returns a list of files in a local vector store folder.
 */
function getFilesInFolder(VSName) {
  const folderPath = path.join(KB_PATH, VSName);
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  return fs.readdirSync(folderPath).filter((name) => {
    const fullPath = path.join(folderPath, name);
    return fs.lstatSync(fullPath).isFile();
  });
}

/**
 * Sync a single vector store folder:
 * - Creates the vector store if missing
 * - Deletes files removed locally
 * - Adds/updates changed files
 */
async function syncFolder(VSName) {
  if (!isVSInConfig({VSName})) {
    await createEmptyVS({VSName});
  }

  const config = JSON.parse(fs.readFileSync(VS_CONFIG_PATH, 'utf-8'));
  const knownFiles = config[VSName]?.files || {};
  const localFiles = getFilesInFolder(VSName);

  const localFileSet = new Set(localFiles);
  const knownFileSet = new Set(Object.keys(knownFiles));

  // Delete remote files missing locally
  await Promise.all(
      [...knownFileSet].filter((file) => !localFileSet.has(file)).map(async (file) => {
        console.log(`🗑️  Deleting missing file '${file}' from '${VSName}'`);
        await deleteFile({fileName: file, VSName});
      }),
  );

  // Add new files or replace changed ones
  for (const file of localFileSet) {
    const hash = fileHash({fileName: file, VSName});
    const knownEntry = knownFiles[file];

    if (!knownEntry) {
      console.log(`➕ Adding new file '${file}' to '${VSName}'`);
      await addFile({fileName: file, VSName});
    } else if (!isFileHashMatch({fileName: file, VSName, currentHash: hash})) {
      console.log(`♻️  Replacing modified file '${file}' in '${VSName}'`);
      await deleteFile({fileName: file, VSName});
      await addFile({fileName: file, VSName});
    } else {
      console.log(`✅ File '${file}' in '${VSName}' is up to date.`);
    }
  }
}

/**
 * Sync all local vector store folders and remove stale ones.
 */
async function syncAllFolders() {
  const folders = getVectorStoreFolderNames();
  if (!Array.isArray(folders)) {
    throw new Error('getVectorStoreFolderNames did not return an array');
  }

  for (const folder of folders) {
    console.log(`\n🔄 Syncing vector store '${folder}'`);
    try {
      await syncFolder(folder);
    } catch (err) {
      console.error(`❌ Failed to sync '${folder}': ${err.message}`);
    }
  }

  console.log(`\n🧹 Cleaning up vector stores missing from local folders...`);
  await deleteMissingVectorStoresFromConfig();
  console.log('\n✅ Full sync complete.');
}

// Only run when called directly (not imported)
if (require.main === module) {
  syncAllFolders().catch((err) => {
    console.error('Fatal sync error:', err.message);
  });
}


module.exports = {
  syncFolder,
  syncAllFolders,
  getFilesInFolder,
};
