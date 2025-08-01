// scripts/assistantSync.js
const fs = require('fs');
const path = require('path');
const {
  listAssistants,
  createAssistant2,
  deleteAssistant,
  modifyAssistant,
  retrieveAssistant,
} = require('../helpers/openAI');

const ASSISTANT_CONFIG_PATH = path.join(__dirname, '..', 'config', 'assistantConfig.json');
const VS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'VSConfig.json');
const {schema: escalateSchema} = require('./escalateTool');


// ─────────────────────────────────────────────
// Helpers for config I/O
function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────────
// Resolve vector store slugs to OpenAI IDs
function resolveVectorStoreIds(slugs, vsConfig) {
  return slugs.map((slug) => {
    const vs = vsConfig[slug];
    if (!vs || !vs.id) {
      throw new Error(`Invalid vector store slug '${slug}'`);
    }
    return vs.id;
  });
}

// ─────────────────────────────────────────────
// Create or update a single assistant
async function createOrUpdateAssistant(slug, assistantObj) {
  const vsConfig = loadJSON(VS_CONFIG_PATH);
  const resolvedVSIds = resolveVectorStoreIds(assistantObj.vector_store_slugs || [], vsConfig);

  const payload = {
    name: assistantObj.name,
    instructions: assistantObj.instructions,
    model: assistantObj.model,
    tools: [
      ...(resolvedVSIds.length > 0 ? [{type: 'file_search'}] : []),
      {type: 'function', function: escalateSchema.function}, // ✅ REGISTER TOOL
    ],
    tool_resources: resolvedVSIds.length > 0 ?
    {file_search: {vector_store_ids: resolvedVSIds}} :
    undefined,
  };


  if (!assistantObj.id) {
    const id = await createAssistant2(payload);
    if (id) {
      console.log(`✅ Created assistant '${slug}' → ${id}`);
      assistantObj.id = id;
      return id;
    }
    throw new Error(`❌ Failed to create assistant '${slug}'`);
  } else {
    const remote = await retrieveAssistant({assistantId: assistantObj.id});

    const remoteVSIds = remote?.tool_resources?.file_search?.vector_store_ids || [];
    const remoteModel = remote?.model;
    const remoteInstructions = remote?.instructions;

    const changed = (
      remoteInstructions !== assistantObj.instructions ||
      remoteModel !== assistantObj.model ||
      JSON.stringify(remoteVSIds.sort()) !== JSON.stringify(resolvedVSIds.sort())
    );

    if (changed) {
      await modifyAssistant({assistantId: assistantObj.id, ...payload});
      console.log(`🔄 Updated assistant '${slug}' (${assistantObj.id})`);
    } else {
      console.log(`✅ Assistant '${slug}' is up to date.`);
    }

    return assistantObj.id;
  }
}


// ─────────────────────────────────────────────
// Delete any assistants in OpenAI not present in config
async function deleteMissingAssistants(localConfig, remoteList) {
  const remoteSlugsById = Object.fromEntries(remoteList.map((a) => [a.id, a.name]));
  const localIds = new Set(Object.values(localConfig).map((a) => a.id));

  for (const id of Object.keys(remoteSlugsById)) {
    if (!localIds.has(id)) {
      console.log(`🗑️  Deleting assistant not in config: ${remoteSlugsById[id]} (${id})`);
      await deleteAssistant(id);
    }
  }
}

// ─────────────────────────────────────────────
// Full sync: create/update config assistants and delete extras
async function syncAllAssistants() {
  const config = loadJSON(ASSISTANT_CONFIG_PATH);
  const remote = await listAssistants();
  const remoteList = remote?.data || [];

  for (const [slug, assistantObj] of Object.entries(config)) {
    try {
      await createOrUpdateAssistant(slug, assistantObj);
    } catch (err) {
      console.error(`❌ Failed to sync assistant '${slug}':`, err.message);
    }
  }

  await deleteMissingAssistants(config, remoteList);
  saveJSON(ASSISTANT_CONFIG_PATH, config);
  console.log('\n✅ Assistant sync complete.');
}

// ─────────────────────────────────────────────
// Run if called directly
if (require.main === module) {
  syncAllAssistants().catch((err) => console.error('Fatal sync error:', err));
}

// ─────────────────────────────────────────────
// Exports for use in assistantChat.js
module.exports = {
  createOrUpdateAssistant,
  syncAllAssistants,
  deleteMissingAssistants,
};
