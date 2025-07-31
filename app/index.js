
// scripts/showChunkingFromOpenAI.js

const {
  listVectorStores,
  searchVectorStoreFiles,
} = require('../helpers/openAI'); // make sure this points to your helper file

const axios = require('axios');
const { OPEN_AI_API_TOKEN } = require('../config/config');

const openAPIHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPEN_AI_API_TOKEN}`,
  'OpenAI-Beta': 'assistants=v2',
};

async function retrieveVectorStoreFile(fileId) {
  if (!fileId) return null;
  try {
    const response = await axios.get(
      `https://api.openai.com/v1/vector_store_files/${fileId}`,
      { headers: openAPIHeaders }
    );
    return response.data;
  } catch (err) {
    console.error(`❌ Error retrieving vector_store_file ${fileId}:`, err.response?.data || err.message);
    return null;
  }
}

async function showChunkingStrategies() {
  const vectorStores = await listVectorStores();

  if (!vectorStores || !vectorStores.data || vectorStores.data.length === 0) {
    console.log('❌ No vector stores found.');
    return;
  }

  for (const vs of vectorStores.data) {
    console.log(`\n📦 Vector Store: ${vs.name} (${vs.id})`);

    const files = await searchVectorStoreFiles(vs.id);
    if (!files || !files.data || files.data.length === 0) {
      console.log('  No files found.');
      continue;
    }

    for (const file of files.data) {
      const fileMeta = await retrieveVectorStoreFile(file.id);
      const strategy = fileMeta?.chunking_strategy;

      console.log(`  📄 File: ${file.id}`);
      if (strategy?.type === 'static') {
        console.log(`     ↳ Chunk size: ${strategy.static.max_chunk_size_tokens}`);
        console.log(`     ↳ Overlap:    ${strategy.static.chunk_overlap_tokens}`);
      } else if (strategy?.type) {
        console.log(`     ↳ Type: ${strategy.type} (non-static or dynamic strategy)`);
      } else {
        console.log('     ↳ No chunking strategy info.');
      }
    }
  }
}

showChunkingStrategies().catch((err) => {
  console.error('❌ Script failed:', err.message);
});
