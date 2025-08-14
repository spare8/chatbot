// server/controllers/threads/deleteThread.js
const {getThreadByRoomId, deleteThreadById} = require('../../dbInteractions');
const {deleteThread: deleteThreadOA} = require('../../../../helpers/openAI');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/thread/delete
 * Body: { roomId: string }
 * Deletes OA thread (if present) then deletes DB thread.
 */
module.exports = asyncHandler(async function deleteThread(req, res) {
  const {roomId} = req.body || {};
  if (!roomId) {
    return res.status(400).json({error: 'roomId is required'});
  }

  const thread = await getThreadByRoomId({roomId});
  if (!thread) {
    return res.status(404).json({error: 'Thread not found'});
  }

  if (thread.threadOpenAIId) {
    await deleteThreadOA(thread.threadOpenAIId); // bubbles errors to error middleware
  }

  await deleteThreadById({threadId: thread._id});

  return res.json({ok: true, deleted: true});
});
