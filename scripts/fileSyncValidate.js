const fs = require('fs');
const path = require('path');
const {listAllFiles} = require('../helpers/openAI');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'filesConfig.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

(async () => {
  try {
    const config = loadConfig();
    const configFileNames = new Set(Object.keys(config));

    const openAIFiles = await listAllFiles();
    const openAIFilenames = new Set(openAIFiles.map((f) => f.filename));

    // Files in OpenAI but not in config
    const onlyInOpenAI = [...openAIFilenames].filter((f) => !configFileNames.has(f));
    if (onlyInOpenAI.length > 0) {
      console.log('Files in OpenAI but missing from config:');
      onlyInOpenAI.forEach((f) => console.log('   🔹', f));
    } else {
      console.log('All OpenAI files are reflected in config.');
    }

    // Files in config but not in OpenAI
    const onlyInConfig = [...configFileNames].filter((f) => !openAIFilenames.has(f));
    if (onlyInConfig.length > 0) {
      console.log('\n Files in config but missing from OpenAI:');
      onlyInConfig.forEach((f) => console.log('   🔸', f));
    } else {
      console.log('All config files exist on OpenAI.');
    }
  } catch (err) {
    console.error('Validation failed:', err.message);
  }
})();
