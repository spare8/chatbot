// server/controllers/messages/sendMessage.js
const {
  getThreadByRoomId,
  saveUserMessage,
  saveAssistantMessage,
} = require('../../dbInteractions');

const {
  createUserMessage,
  createRunWithOptions,
  retrieveRun,
  listMessagesInThread,
} = require('../../../../helpers/openAI');

const Message = require('../../../../models/message');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

async function waitForRunCompletion(
    threadOpenAIId,
    runId,
    {intervalMs = 1000, timeoutMs = 45000} = {},
) {
  const maxPolls = Math.ceil(timeoutMs / intervalMs);

  for (let i = 0; i < maxPolls; i++) {
    const run = await retrieveRun(threadOpenAIId, runId);
    const s = run?.status;

    if (s === 'completed') {
      return run;
    }

    if (s === 'failed' || s === 'cancelled' || s === 'expired') {
      const e = new Error(
          `Run ${s}${run?.last_error?.message ? `: ${run.last_error.message}` : ''}`,
      );
      e.status = 502;
      throw e;
    }

    if (s === 'requires_action') {
      const e = new Error('Run requires tool handling');
      e.status = 501;
      throw e;
    }

    // wait before next poll (skip after last iteration)
    if (i < maxPolls - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  const e = new Error('Run timed out');
  e.status = 504;
  throw e;
}


function extractAssistantText(oaMessage) {
  if (!oaMessage) {
    return '';
  }
  const c = oaMessage.content;
  if (Array.isArray(c)) {
    const tb = c.find((p) => p?.type === 'text');
    if (tb?.text?.value) {
      return tb.text.value;
    }
  }
  if (typeof oaMessage.content === 'string') {
    return oaMessage.content;
  }
  return '';
}

/**
 * POST /chat/message/send
 * Body: { roomId: string, content: string, userId?: string, options?: object }
 */
module.exports = asyncHandler(async function sendMessage(req, res) {
  const {roomId, content, userId = null, options = {}} = req.body || {};
  if (!roomId) {
    return res.status(400).json({error: 'roomId is required'});
  }
  if (!(typeof content === 'string')) {
    return res.status(400).json({error: 'content is required'});
  }

  const thread = await getThreadByRoomId({roomId});
  if (!thread) {
    return res.status(404).json({error: 'Thread not found'});
  }

  const posted = await createUserMessage(thread.threadOpenAIId, content);
  if (!posted?.id) {
    return res.status(502).json({error: 'Failed to create user message on OpenAI'});
  }

  const userMsg = await saveUserMessage({threadId: thread._id, content, userId, attachments: []});
  await Message.findByIdAndUpdate(userMsg._id, {$set: {openaiMessageId: posted.id}});

  const run = await createRunWithOptions(thread.threadOpenAIId, {
    assistant_id: thread.assistantOpenAIId,
    ...options,
  });
  if (!run?.id) {
    return res.status(502).json({error: 'Failed to create run'});
  }

  const finished = await waitForRunCompletion(thread.threadOpenAIId, run.id);

  const msgList = await listMessagesInThread(thread.threadOpenAIId, 20);
  const items = Array.isArray(msgList?.data) ? msgList.data : [];
  const latestAssistant = items.find((m) => m.role === 'assistant');
  const replyText = extractAssistantText(latestAssistant) || '';

  const asstMsg = await saveAssistantMessage({
    threadId: thread._id,
    content: replyText,
    assistantId: thread.assistantOpenAIId,
    runId: finished.id,
    usage: finished?.usage ? {
      prompt_tokens: finished.usage.prompt_tokens || 0,
      completion_tokens: finished.usage.completion_tokens || 0,
      total_tokens: finished.usage.total_tokens || 0,
    } : undefined,
    status: 'completed',
  });

  if (latestAssistant?.id) {
    await Message.findByIdAndUpdate(asstMsg._id, {$set: {openaiMessageId: latestAssistant.id}});
  }

  return res.status(200).json({
    ok: true,
    reply: replyText,
    userMessageId: String(userMsg._id),
    assistantMessageId: String(asstMsg._id),
    runId: finished.id,
    usage: finished?.usage || undefined,
  });
});
