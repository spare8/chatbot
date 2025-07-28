const readline = require('readline');
const {createUserMessage, createRun, retrieveRun, listMessagesInThread} = require('../helpers/openAI');

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

async function waitForRunCompletion(threadId, runId) {
  let status = 'in_progress';
  while (status === 'in_progress' || status === 'queued') {
    const run = await retrieveRun(threadId, runId);
    status = run.status;
    if (status === 'completed') {
      return;
    }
    if (status === 'failed') {
      throw new Error(`Run failed: ${run.last_error?.message}`);
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
}

module.exports = async function chatLoop(slug, threadId, assistantId) {
  console.log(`\n💬 Chat session started with '${slug}'. Type 'exit' to end.\n`);

  while (true) {
    const userInput = await promptInput('You: ');
    if (['exit', 'quit'].includes(userInput.toLowerCase())) {
      console.log('👋 Chat session ended.');
      break;
    }

    await createUserMessage(threadId, userInput);
    console.log(userInput);
    const run = await createRun({threadId, assistantId});
    await waitForRunCompletion(threadId, run.id);

    const messages = await listMessagesInThread(threadId);

    const assistantMessages = messages.data
        .filter((msg) => msg.role === 'assistant')
        .sort((a, b) => b.created_at - a.created_at); // sort latest first

    const reply = assistantMessages[0];
    const replyText = reply?.content?.[0]?.text?.value || '[No response]';

    console.log(`\n🧠 Assistant: ${replyText}\n`);
  }
};
