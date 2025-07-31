const readline = require('readline');
const {
  createUserMessage,
  createRun,
  retrieveRun,
  listMessagesInThread,
  listRunSteps,
  submitToolOutputs,
} = require('../helpers/openAI');

const { handler: escalateHandler } = require('./escalateTool'); // 🔧 Load your local tool

function promptInput(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(promptText, ans => {
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

async function handleToolCalls(threadId, runId) {
  const steps = await listRunSteps(threadId, runId);
  const toolSteps = steps.data.filter(s => s.type === 'tool_calls');

  for (const step of toolSteps) {
    const calls = step?.step_details?.tool_calls || [];

    for (const call of calls) {
      const func = call?.function;

      if (!func || !func.name) {
        console.warn('⚠️ Skipping invalid tool call (missing function or name). Full call object:');
        console.dir(call, { depth: null, colors: true });
        continue;
      }

      const funcName = func.name;
      const args = JSON.parse(func.arguments || '{}');
      let result;

      if (funcName === 'escalateToHuman') {
        result = await escalateHandler(args);
      } else {
        console.warn(`⚠️ Unknown tool called: ${funcName}`);
        result = { message: `Unknown tool: ${funcName}` };
      }

      await submitToolOutputs(
        threadId,
        runId,
        [{
          tool_call_id: call.id,
          output: JSON.stringify(result),
        }]
      );

      console.log(`✅ Tool '${funcName}' handled and output submitted.`);
      await waitForRunCompletion(threadId, runId);
    }
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
    const run = await createRun({ threadId, assistantId });

    await waitForRunCompletion(threadId, run.id);
    await handleToolCalls(threadId, run.id); // 🧠 Check for tool calls

    const messages = await listMessagesInThread(threadId);
    const assistantMessages = messages.data
      .filter(msg => msg.role === 'assistant')
      .sort((a, b) => b.created_at - a.created_at); // sort latest first

    const reply = assistantMessages[0];
    const replyText = reply?.content?.[0]?.text?.value || '[No response]';

    console.log(`\n🧠 Assistant: ${replyText}\n`);
  }
};
