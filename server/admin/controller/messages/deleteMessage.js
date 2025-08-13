// server/controllers/messages/deleteMessage.js
const {getThreadByRoomId} = require('../../dbInteractions');
const {deleteMessage: deleteOAMessage} = require('../../../../helpers/openAI');
const Message = require('../../../../models/message');
const Thread = require('../../../../models/thread');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /chat/message/delete
 * Body: { roomId: string, messageId: string }
 * Deletes on OpenAI (if openaiMessageId present) then deletes in Mongo.
 */
module.exports = asyncHandler(async function deleteMessage(req, res) {
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

  if (thread.threadOpenAIId && msg.openaiMessageId) {
    await deleteOAMessage(thread.threadOpenAIId, msg.openaiMessageId);
  }

  await Message.findByIdAndDelete(messageId);
  await Thread.findByIdAndUpdate(thread._id, {$pull: {messages: msg._id}});

  const latest = await Message.find({threadId: thread._id}).sort({createdAt: -1}).limit(1);
  const lastAt = latest.length ? latest[0].createdAt : new Date();
  await Thread.findByIdAndUpdate(thread._id, {$set: {lastMessageAt: lastAt}});

  return res.json({ok: true, deleted: true});
});
