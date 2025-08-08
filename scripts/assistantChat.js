const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {createThread} = require('../helpers/openAI');
const {createOrUpdateAssistant} = require('./assistantSync');
const chatLoop = require('./chatLoop');

const ASSISTANT_CONFIG_PATH = path.join(__dirname, '..', 'config', 'assistantConfig.json');
const VS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'VSConfig.json');

function loadConfig(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function saveConfig(config, filepath) {
  fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
}

function promptInput(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(promptText, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function setupAssistant() {
  const config = loadConfig(ASSISTANT_CONFIG_PATH);
  const vsConfig = loadConfig(VS_CONFIG_PATH);
  const slugs = Object.keys(config);

  console.log('\nAvailable assistants:');
  slugs.forEach((slug, i) => {
    console.log(`  [${i + 1}] ${slug} - ${config[slug].name}`);
  });
  console.log('  [N] New Assistant');

  const choice = (await promptInput('Select assistant [number/N]: ')).toLowerCase();
  let slug; let assistant;

  if (choice === 'n') {
    slug = await promptInput('New slug: ');
    const name = await promptInput('Name: ');
    const instructions = await promptInput('Instructions: ');
    const model = await promptInput('Model (default: gpt-3.5-turbo): ') || 'gpt-3.5-turbo';

    console.log('\nAvailable Vector Stores:');
    const vsSlugs = Object.keys(vsConfig);
    vsSlugs.forEach((vs, i) => {
      const data = vsConfig[vs] || {};
      const fileList = Array.isArray(data.files) ?
        data.files :
        Object.keys(data.files || {});
      console.log(`  [${i + 1}] ${vs} → ${fileList.join(', ') || 'No files'}`);
    });

    const vsInput = await promptInput('Comma-separated vector store slugs (or blank): ');
    const vectorStoreSlugs = vsInput ? vsInput.split(',').map((v) => v.trim()) : [];

    assistant = {
      name,
      instructions,
      model,
      vector_store_slugs: vectorStoreSlugs,
      thread_ids: [],
    };
    config[slug] = assistant;
  } else {
    const index = parseInt(choice, 10) - 1;
    slug = slugs[index];
    assistant = config[slug];

    const modify = (await promptInput('Modify this assistant? (y/n): ')).toLowerCase();
    if (modify === 'y') {
      const name = await promptInput(`Name (${assistant.name}): `) || assistant.name;
      const instructions = await promptInput(`Instructions (${assistant.instructions}): `) || assistant.instructions;
      const model = await promptInput(`Model (${assistant.model}): `) || assistant.model;

      console.log('\nAvailable Vector Stores:');
      const vsSlugs = Object.keys(vsConfig);
      vsSlugs.forEach((vs, i) => {
        const data = vsConfig[vs] || {};
        const fileList = Array.isArray(data.files) ?
          data.files :
          Object.keys(data.files || {});
        console.log(`  [${i + 1}] ${vs} → ${fileList.join(', ') || 'No files'}`);
      });

      const vsInput = await promptInput('Comma-separated vector store slugs (or blank to remove all): ');
      const vectorStoreSlugs = vsInput ? vsInput.split(',').map((v) => v.trim()) : [];

      assistant.name = name;
      assistant.instructions = instructions;
      assistant.model = model;
      assistant.vector_store_slugs = vectorStoreSlugs;
    }
  }

  const assistantId = await createOrUpdateAssistant(slug, assistant);
  assistant.id = assistantId;
  saveConfig(config, ASSISTANT_CONFIG_PATH);

  console.log(`\nAssistant ID: ${assistantId}`);

  // THREAD
  const reuse = assistant.thread_ids.length > 0 ?
    await promptInput('Reuse existing thread? (y/n): ') :
    'n';

  let threadId;
  if (reuse === 'y') {
    assistant.thread_ids.forEach((tid, i) => {
      console.log(`  [${i + 1}] ${tid}`);
    });
    const tidChoice = await promptInput('Pick thread number: ');
    threadId = assistant.thread_ids[parseInt(tidChoice, 10) - 1];
  } else {
    const thread = await createThread();
    threadId = thread.id;
    assistant.thread_ids.push(threadId);
    saveConfig(config, ASSISTANT_CONFIG_PATH);
    console.log(`🧵 Created new thread: ${threadId}`);
  }

  return {slug, threadId, assistantId};
}

(async () => {
  try {
    const {slug, threadId, assistantId} = await setupAssistant();
    await chatLoop(slug, threadId, assistantId);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
