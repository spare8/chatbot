// server/controllers/threads/getThreadFullByOA.js
const {
  getThreadByOpenAIId,
  getMessagesByThreadId,
} = require('../../dbInteractions');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/thread/oa/full
 * Body: { threadOpenAIId: string, limit?: number, beforeId?: string }
 * Returns: { ok, thread, messages (ascending), nextCursor }
 */
module.exports = asyncHandler(async function getThreadFullByOA(req, res) {
  const {threadOpenAIId, limit, beforeId} = req.body || {};
  if (!threadOpenAIId) {
    return res.status(400).json({error: 'threadOpenAIId is required'});
  }

  const lim = typeof limit === 'number' ? limit : 50;

  const thread = await getThreadByOpenAIId({threadOpenAIId});
  if (!thread) {
    return res.status(404).json({error: 'Thread not found'});
  }

  const {messages, nextCursor} = await getMessagesByThreadId({
    threadId: String(thread._id),
    beforeId: beforeId || null,
    limit: lim,
  });

  return res.json({
    ok: true,
    thread,
    messages,
    nextCursor,
  });
});
