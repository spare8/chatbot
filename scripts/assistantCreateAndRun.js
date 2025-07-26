const readline = require('readline');
const {
  createAssistant,
  createThread,
  createUserMessage,
  createRun,
  retrieveRun,
  listMessagesInThread,
  deleteThread,
  deleteAssistant,
} = require('../helpers/openAI');

function promptInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function waitForRunCompletion(threadId, runId) {
  let status = 'in_progress';
  while (status === 'in_progress' || status === 'queued') {
    const run = await retrieveRun(threadId, runId);
    status = run.status;
    if (status === 'completed') return;
    if (status === 'failed') throw new Error(`Run failed: ${run.last_error?.message}`);
    await new Promise(res => setTimeout(res, 1500));
  }
}

(async () => {
  try {
    console.log('\nWelcome to the Assistant CLI Session\n');

    const name = await promptInput('Assistant name: ');
    const instructions = await promptInput('Assistant instructions: ');
    const vectorStoreId = await promptInput('Optional: Vector store ID (leave blank for none): ');

    const assistant = await createAssistant({
      name,
      instructions,
      tools: vectorStoreId ? [{ type: 'file_search' }] : [],
      model: 'gpt-3.5-turbo',
      file_ids: [],
      tool_resources: vectorStoreId ? { file_search: { vector_store_ids: [vectorStoreId] } } : undefined,
    });

    if (!assistant) {
      console.error('Assistant creation failed.');
      return;
    }

    console.log(`Assistant created: ${assistant}`);

    const thread = await createThread();
    const threadId = thread.id;
    console.log(`Thread created: ${threadId}`);

    while (true) {
      const userInput = await promptInput('\nYou: ');
      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log('\nEnding chat...');
        await deleteThread(threadId);
        await deleteAssistant(assistant);
        console.log('Assistant and thread deleted. Goodbye.');
        break;
      }

      await createUserMessage(threadId, userInput);
      const run = await createRun({ threadId, assistantId: assistant });
      await waitForRunCompletion(threadId, run.id);

      const messages = await listMessagesInThread(threadId);
      const reply = messages.data.find(msg => msg.role === 'assistant');
      const text = reply?.content?.[0]?.text?.value || '[No response]';

      console.log(`Assistant: ${text}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
