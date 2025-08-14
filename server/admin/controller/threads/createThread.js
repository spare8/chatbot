// server/controllers/threads/createThread.js
const crypto = require('crypto');

// DB layer (pure Mongo ops)
const {createThread: createThreadDB} = require('../../dbInteractions');

// OpenAI helpers
const {
  createThread: createThreadOA,
  deleteThread: deleteThreadOA, // for cleanup if DB persist fails
} = require('../../../../helpers/openAI');

// Minimal async wrapper so we don't need try/catch blocks
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/thread
 * Body:
 *   - assistantOpenAIId: string (required, asst_*)
 *   - userId?: string
 *
 * Response: { ok, roomId, threadOpenAIId, threadId }
 */
module.exports = asyncHandler(async function createThread(req, res) {
  const {assistantOpenAIId, userId = null} = req.body || {};
  if (!assistantOpenAIId) {
    return res.status(400).json({error: 'assistantOpenAIId is required'});
  }

  // 1) Create OpenAI thread (will throw on network/API error; handled by asyncHandler)
  const oa = await createThreadOA();
  if (!oa?.id) {
    // helper returned a falsy payload; surface as a 502 without try/catch
    return res.status(502).json({error: 'Failed to create OpenAI thread'});
  }

  // 2) Create DB thread; if this fails, best-effort delete the OA thread and rethrow
  const roomId = crypto.randomUUID();
  const doc = await createThreadDB({
    roomId,
    assistantOpenAIId, // asst_*
    userId,
    threadOpenAIId: oa.id, // thread_*
    lastMessageAt: new Date(),
    messages: [],
  }).catch(async (err) => {
    // attempt cleanup; ignore cleanup errors; then rethrow original
    await deleteThreadOA(oa.id).catch(() => {});
    throw err;
  });

  // 3) Respond
  return res.status(201).json({
    ok: true,
    roomId,
    threadOpenAIId: oa.id,
    threadId: String(doc._id),
  });
});


