const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  uploadFileToOpenAI,
  deleteFileById,
} = require('../helpers/openAI');

const RAW_FOLDER = path.join(__dirname, '..', 'rawFiles');
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'filesConfig.json');

// Utility: get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Load existing config (or initialize empty)
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

// Save updated config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

(async () => {
  try {
    const localConfig = loadConfig();
    const updatedConfig = {};
    const rawFiles = fs.readdirSync(RAW_FOLDER).filter((file) => fs.statSync(path.join(RAW_FOLDER, file)).isFile());

    console.log(`Found ${rawFiles.length} file(s) in rawFiles/`);

    // Step 1: Upload new or changed files
    for (const file of rawFiles) {
      const fullPath = path.join(RAW_FOLDER, file);
      const hash = getFileHash(fullPath);

      const current = localConfig[file];

      if (!current) {
        console.log(`🆕 New file: ${file}`);
      } else if (current.hash !== hash) {
        console.log(`🔁 File changed: ${file}`);
        await deleteFileById(current.id);
      } else {
        // No change
        updatedConfig[file] = current;
        continue;
      }

      const uploaded = await uploadFileToOpenAI(fullPath);
      if (uploaded && uploaded.id) {
        updatedConfig[file] = {id: uploaded.id, hash};
        console.log(`Uploaded: ${file} (ID: ${uploaded.id})`);
      } else {
        console.error(`Failed to upload ${file}`);
      }
    }

    // Step 2: Delete OpenAI files no longer in rawFiles/
    const deletedFiles = Object.keys(localConfig).filter((name) => !rawFiles.includes(name));
    for (const file of deletedFiles) {
      console.log(`Removing deleted file from OpenAI: ${file}`);
      await deleteFileById(localConfig[file].id);
    }

    // Step 3: Finalize config update
    saveConfig(updatedConfig);
    console.log('\n filesConfig.json updated successfully.');
  } catch (err) {
    console.error('Sync failed:', err.message);
  }
})();
