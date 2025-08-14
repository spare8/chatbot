// server/dbInteractions/assistantDb.js
const Assistants = require('../../models/assistant');
const VectorStores = require('../../models/vectorStore');
const VSFiles = require('../../models/VSFile');
const Thread = require('../../models/thread');
const Message = require('../../models/message');
const mongoose = require('mongoose');

const OID = mongoose.Types.ObjectId;
/**
 * Create a new assistant
 * @param {Object} data - Assistant properties
 * @returns {Promise<Object>} - Created assistant document
 */
function createAssistant({name, description, instructions, model, vectorStoreId, openaiId}) {
  if (!name || !model || !openaiId) {
    return Promise.reject(
        new Error('Name, model and openaiId are required to create an assistant'),
    );
  }
  return Assistants.create({
    name, description, instructions, model, vectorStoreId, openaiId,
  });
}
function createVectorStore({name, openaiId, description, maxChunkOverlap, maxChunkSize}) {
  if (!name || !description || !openaiId || !maxChunkOverlap || !maxChunkSize) {
    return Promise.reject(
        new Error('Insufficient Params to create a vector store'),
    );
  }
  return VectorStores.create({name, openaiId, description, maxChunkOverlap, maxChunkSize});
}
async function createFile({fileName, openaiId, vectorStoreId, fileSize}) {
  if (!fileName || !vectorStoreId || !openaiId || !fileSize) {
    throw new Error('Insufficient Params to create a vector store');
  }
  await Promise.all([
    VSFiles.create({fileName, openaiId, vectorStoreId, fileSize}),
    VectorStores.findOneAndUpdate(
        {openaiId: vectorStoreId},
        {$push: {files: openaiId}},
    ),
  ]);
}

/**
 * Retrieve a single assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Found assistant or null
 */
function getAssistantById({assistantId}) {
  return Assistants.findOne({openaiId: assistantId});
}
function getVectorStoreById({vectorStoreId}) {
  return VectorStores.findOne({openaiId: vectorStoreId});
}

/**
 * Retrieve all assistants
 * @returns {Promise<Array>} - Array of assistant documents
 */
function getAllAssistants() {
  return Assistants.find({isDeleted: {$ne: true}});
}
function getAllVectorStores() {
  return VectorStores.find({isDeleted: {$ne: true}})
      .populate({
        path: 'vsFiles',
        select: 'fileName openaiId fileSize updatedAt',
      });
}


/**
 * Update an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} - Updated assistant or null
 */
// function updateAssistant({assistantId, name, description, instructions, model, vectorStoreId, temperature}) {
//   return Assistants.findOneAndUpdate({openaiId: assistantId},
//       {name, description, instructions, model, vectorStoreId, temperature}, {new: true});
// }

function updateAssistant({
  assistantId,
  name,
  description,
  instructions,
  model,
  vectorStoreId,
  temperature,
  tools,
  toolResources, // <-- note: DB field is camelCase
  metadata,
  isDeleted,
}) {
  // Build a $set object with only defined keys
  const payload = {};
  const addIfDefined = (k, v) => {
    if (v !== undefined) {
      payload[k] = v;
    }
  };

  addIfDefined('name', name);
  addIfDefined('description', description);
  addIfDefined('instructions', instructions);
  addIfDefined('model', model);
  addIfDefined('vectorStoreId', vectorStoreId);
  addIfDefined('temperature', temperature);
  addIfDefined('tools', tools);
  addIfDefined('toolResources', toolResources); // <-- persists tool resources
  addIfDefined('metadata', metadata);
  addIfDefined('isDeleted', isDeleted);

  return Assistants.findOneAndUpdate(
      {openaiId: assistantId},
      {$set: payload},
      {new: true, runValidators: true},
  );
}

function updateVectorStore({vectorStoreId, name, description}) {
  return VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {name, description}, {new: true});
}

/**
 * Delete an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Deleted assistant or null
 */
function deleteAssistant({assistantId}) {
  return Assistants.findOneAndUpdate({openaiId: assistantId}, {isDeleted: true});
}
function deleteVectorStore({vectorStoreId}) {
  return VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {isDeleted: true});
}
async function deleteFile({vectorStoreId, fileId}) {
  await Promise.all([
    VSFiles.findOneAndUpdate({openaiId: fileId}, {isDeleted: true}),
    VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {$pull: {files: fileId}}),
  ]);
}


/* =========================
 * THREADS (DB-ONLY)
 * ========================= */

/** Create a Thread (DB-only) */
function createThread({
  roomId,
  assistantOpenAIId,
  userId = null,
  threadOpenAIId = null,
  lastMessageAt = new Date(),
  messages = [],
}) {
  if (!roomId) {
    const e = new Error('roomId is required'); e.status = 400; throw e;
  }
  if (!assistantOpenAIId) {
    const e = new Error('assistantOpenAIId is required'); e.status = 400; throw e;
  }

  return Thread.create({
    roomId,
    assistantOpenAIId,
    userId,
    threadOpenAIId,
    lastMessageAt,
    messages: Array.isArray(messages) ? messages : [],
  });
}

/** Fetch a thread by roomId (used for routing/idempotency) */
function getThreadByRoomId({roomId}) {
  if (!roomId) {
    const e = new Error('roomId is required'); e.status = 400; throw e;
  }
  return Thread.findOne({roomId});
}

/** Fetch a thread by OpenAI thread id */
function getThreadByOpenAIId({threadOpenAIId}) {
  if (!threadOpenAIId) {
    const e = new Error('threadOpenAIId is required'); e.status = 400; throw e;
  }
  return Thread.findOne({threadOpenAIId});
}

/** List threads for a user (cursor pagination by _id) */
async function listThreadsForUser({userId, limit = 20, cursor = null}) {
  if (!userId) {
    const e = new Error('userId is required'); e.status = 400; throw e;
  }

  const query = {userId};
  if (cursor) {
    if (!OID.isValid(cursor)) {
      const e = new Error('Invalid cursor'); e.status = 400; throw e;
    }
    query._id = {$lt: new OID(cursor)};
  }

  const rows = await Thread.find(query)
      .sort({_id: -1})
      .limit(Number(limit));

  const nextCursor = rows.length ? rows[rows.length - 1]._id : null;
  return {threads: rows, nextCursor};
}

/** Archive / unarchive a thread in DB */
function archiveThread({threadId, archived = true}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }

  return Thread.findByIdAndUpdate(
      threadId,
      {$set: {archived}},
      {new: true},
  );
}

/** Update title and/or metadata */
function updateThreadMeta({threadId, title, metadata}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }

  const $set = {};
  if (typeof title !== 'undefined') {
    $set.title = title;
  }
  if (typeof metadata !== 'undefined') {
    $set.metadata = metadata;
  }
  if (Object.keys($set).length === 0) {
    const e = new Error('Nothing to update'); e.status = 400; throw e;
  }

  return Thread.findByIdAndUpdate(threadId, {$set}, {new: true, runValidators: true});
}

/** Update lastMessageAt explicitly */
function updateLastMessageAt({threadId, when = new Date()}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }

  return Thread.findByIdAndUpdate(threadId, {$set: {lastMessageAt: when}}, {new: true});
}

/** Hard delete by DB id */
function deleteThreadById({threadId}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }

  return Thread.findByIdAndDelete(threadId);
}

/** Hard delete by OpenAI thread id */
function deleteThreadByOpenAIId({threadOpenAIId}) {
  if (!threadOpenAIId) {
    const e = new Error('threadOpenAIId is required'); e.status = 400; throw e;
  }
  return Thread.findOneAndDelete({threadOpenAIId});
}

/* =========================
 * MESSAGES (DB-ONLY)
 * ========================= */

/** Save a user message and attach it to the thread */
async function saveUserMessage({threadId, content, attachments = [], userId = null}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }
  if (!((typeof content === 'string') || content === '')) {
    const e = new Error('content is required'); e.status = 400; throw e;
  }

  const thread = await Thread.findById(threadId).select('_id');
  if (!thread) {
    const e = new Error('Thread not found'); e.status = 404; throw e;
  }

  const msg = await Message.create({
    threadId,
    role: 'user',
    content,
    userId,
    assistantId: null,
    attachments: Array.isArray(attachments) ? attachments : [],
    status: 'completed',
  });

  await Thread.findByIdAndUpdate(
      threadId,
      {
        $push: {messages: msg._id},
        $set: {lastMessageAt: new Date()},
      },
      {new: true},
  );

  return msg;
}

/** Save an assistant message and attach it to the thread */
async function saveAssistantMessage({
  threadId,
  content,
  assistantId = null,
  runId = null,
  usage = undefined,
  status = 'completed',
}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }
  if (!((typeof content === 'string') || content === '')) {
    const e = new Error('content is required'); e.status = 400; throw e;
  }

  const thread = await Thread.findById(threadId).select('_id');
  if (!thread) {
    const e = new Error('Thread not found'); e.status = 404; throw e;
  }

  const msg = await Message.create({
    threadId,
    role: 'assistant',
    content,
    userId: null,
    assistantId,
    runId,
    usage,
    status,
  });

  await Thread.findByIdAndUpdate(
      threadId,
      {
        $push: {messages: msg._id},
        $set: {lastMessageAt: new Date()},
      },
      {new: true},
  );

  return msg;
}

/** Mark a message as errored */
function markMessageError({messageId, error}) {
  if (!messageId) {
    const e = new Error('messageId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(messageId)) {
    const e = new Error('Invalid messageId'); e.status = 400; throw e;
  }

  return Message.findByIdAndUpdate(
      messageId,
      {$set: {status: 'error', error}},
      {new: true},
  );
}

/** Get paginated history by roomId (ascending for display) */
async function getHistoryByRoomId({roomId, beforeId = null, limit = 50}) {
  if (!roomId) {
    const e = new Error('roomId is required'); e.status = 400; throw e;
  }

  const thread = await Thread.findOne({roomId}).lean();
  if (!thread) {
    const e = new Error('Thread not found'); e.status = 404; throw e;
  }

  const q = {threadId: thread._id};
  if (beforeId) {
    if (!OID.isValid(beforeId)) {
      const e = new Error('Invalid beforeId'); e.status = 400; throw e;
    }
    q._id = {$lt: new OID(beforeId)};
  }

  const docs = await Message.find(q).sort({_id: -1}).limit(Number(limit));
  const messages = docs.reverse();
  const nextCursor = docs.length ? String(docs[docs.length - 1]._id) : null;

  return {thread, messages, nextCursor};
}

/** Get paginated messages by threadId (ascending for display) */
async function getMessagesByThreadId({threadId, beforeId = null, limit = 50}) {
  if (!threadId) {
    const e = new Error('threadId is required'); e.status = 400; throw e;
  }
  if (!OID.isValid(threadId)) {
    const e = new Error('Invalid threadId'); e.status = 400; throw e;
  }

  const q = {threadId: new OID(threadId)};
  if (beforeId) {
    if (!OID.isValid(beforeId)) {
      const e = new Error('Invalid beforeId'); e.status = 400; throw e;
    }
    q._id = {$lt: new OID(beforeId)};
  }

  const docs = await Message.find(q).sort({_id: -1}).limit(Number(limit));
  const messages = docs.reverse();
  const nextCursor = docs.length ? String(docs[docs.length - 1]._id) : null;

  return {messages, nextCursor};
}


module.exports = {
  createAssistant,
  getAssistantById,
  getAllAssistants,
  updateAssistant,
  updateVectorStore,
  deleteAssistant,
  createVectorStore,
  getAllVectorStores,
  deleteVectorStore,
  getVectorStoreById,
  createFile,
  deleteFile,

  // thread functions
  createThread,
  getThreadByRoomId,
  getThreadByOpenAIId,
  listThreadsForUser,
  archiveThread,
  updateThreadMeta,
  updateLastMessageAt,
  deleteThreadById,
  deleteThreadByOpenAIId,

  // Messages
  saveUserMessage,
  saveAssistantMessage,
  markMessageError,
  getHistoryByRoomId,
  getMessagesByThreadId,
};
