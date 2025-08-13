// server/controllers/threads/listUserThreads.js
const {listThreadsForUser} = require('../../dbInteractions');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/threads/list
 * Body: { userId: string, limit?: number, cursor?: string }
 */
module.exports = asyncHandler(async function listUserThreads(req, res) {
  const {userId, limit, cursor} = req.body || {};
  if (!userId) {
    return res.status(400).json({error: 'userId is required'});
  }

  const result = await listThreadsForUser({
    userId,
    limit: limit ? Number(limit) : 20,
    cursor: cursor || null,
  });

  return res.json({
    ok: true,
    threads: result.threads,
    nextCursor: result.nextCursor ? String(result.nextCursor) : null,
  });
});
