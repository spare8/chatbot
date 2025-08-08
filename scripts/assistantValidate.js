const fs = require('fs');
const path = require('path');
const {
  listAssistants,
} = require('../helpers/openAI');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'assistantConfig.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function formatTools(tools) {
  return Array.isArray(tools) ?
    tools.map((t) => (typeof t === 'string' ? t : t.type)).sort() :
    [];
}

function arraysEqual(a, b) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function logDiff(label, expected, actual) {
  console.log(`  ❌ ${label} mismatch`);
  console.log(`     Config: ${JSON.stringify(expected)}`);
  console.log(`     OpenAI: ${JSON.stringify(actual)}`);
}

async function validateAgainstOpenAI() {
  const config = loadConfig();
  const localSlugs = Object.keys(config);
  const localById = {};
  const localBySlug = {};

  // Index config by assistant ID and slug
  for (const slug of localSlugs) {
    const assistant = config[slug];
    if (assistant.id) {
      localById[assistant.id] = slug;
    }
    localBySlug[slug] = assistant;
  }

  console.log(`🔍 Fetching assistants from OpenAI...`);
  const allRemote = await listAssistants();
  const openaiList = allRemote.data;

  for (const remote of openaiList) {
    const slug = localById[remote.id];
    const local = localBySlug[slug];

    if (!slug || !local) {
      console.log(`\n⚠️ Assistant '${remote.name}' (${remote.id}) not found in local config.`);
      continue;
    }

    console.log(`\n🔎 Validating '${slug}' (${remote.id})`);

    let hasDiff = false;

    if (remote.name !== local.name) {
      logDiff('Name', local.name, remote.name);
      hasDiff = true;
    }

    if (remote.instructions !== local.instructions) {
      logDiff('Instructions', local.instructions, remote.instructions);
      hasDiff = true;
    }

    const localTools = formatTools(local.tools || []);
    const remoteTools = formatTools(remote.tools || []);
    if (!arraysEqual(localTools, remoteTools)) {
      logDiff('Tools', localTools, remoteTools);
      hasDiff = true;
    }

    const localVS = (local.vector_store_ids || []).sort();
    const remoteVS = (remote.tool_resources?.file_search?.vector_store_ids || []).sort();
    if (!arraysEqual(localVS, remoteVS)) {
      logDiff('Vector Store IDs', localVS, remoteVS);
      hasDiff = true;
    }

    if (!hasDiff) {
      console.log(`  ✅ All fields match.`);
    }
  }

  console.log(`\n✅ Assistant validation complete.\n`);
}

validateAgainstOpenAI().catch((err) => {
  console.error('❌ Error during validation:', err.message);
});
