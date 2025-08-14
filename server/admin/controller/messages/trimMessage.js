// server/controllers/messages/trimMessage.js
const {getThreadByRoomId} = require('../../dbInteractions');
const Message = require('../../../../models/message');
const {deleteMessage: deleteOAMessage} = require('../../../../helpers/openAI');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/message/trim
 * Body: { roomId: string, messageId: string }
 * Deletes ONLY on OpenAI (keeps Mongo record).
 */
module.exports = asyncHandler(async function trimMessage(req, res) {
  const {roomId, messageId} = req.body || {};
  if (!roomId) {
    return res.status(400).json({error: 'roomId is required'});
  }
  if (!messageId) {
    return res.status(400).json({error: 'messageId is required'});
  }

  const thread = await getThreadByRoomId({roomId});
  if (!thread) {
    return res.status(404).json({error: 'Thread not found'});
  }

  const msg = await Message.findById(messageId);
  if (!msg) {
    return res.status(404).json({error: 'Message not found'});
  }
  if (String(msg.threadId) !== String(thread._id)) {
    return res.status(409).json({error: 'Message does not belong to this thread'});
  }

  if (!thread.threadOpenAIId) {
    return res.status(409).json({error: 'Thread has no OpenAI thread id'});
  }
  if (!msg.openaiMessageId) {
    return res.status(409).json({error: 'Message has no openaiMessageId'});
  }

  await deleteOAMessage(thread.threadOpenAIId, msg.openaiMessageId);

  return res.json({ok: true, trimmedOnOpenAI: true, openaiMessageId: msg.openaiMessageId});
});
