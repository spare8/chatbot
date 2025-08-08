// server/dbInteractions/assistantDb.js
const Assistants = require('../../models/assistant');
const VectorStores = require('../../models/vectorStore');
const VSFiles = require('../../models/VSFile');

/**
 * Create a new assistant
 * @param {Object} data - Assistant properties
 * @returns {Promise<Object>} - Created assistant document
 */
async function createAssistant({name, description, instructions, model, vectorStoreId, openaiId}) {
  if (!name || !model || !openaiId) {
    throw new Error('Name, model and openaiId are required to create an assistant');
  }
  return await Assistants.create({
    name, description, instructions, model, vectorStoreId, openaiId,
  });
}
async function createVectorStore({name, openaiId, description, maxChunkOverlap, maxChunkSize}) {
  if (!name || !description || !openaiId || !maxChunkOverlap || !maxChunkSize) {
    throw new Error('Insufficient Params to create a vector store');
  }
  return await VectorStores.create({name, openaiId, description, maxChunkOverlap, maxChunkSize});
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
async function getAssistantById({assistantId}) {
  return await Assistants.findOne({openaiId: assistantId});
}
async function getVectorStoreById({vectorStoreId}) {
  return await VectorStores.findOne({openaiId: vectorStoreId});
}

/**
 * Retrieve all assistants
 * @returns {Promise<Array>} - Array of assistant documents
 */
async function getAllAssistants() {
  return await Assistants.find({isDeleted: {$ne: true}});
}
async function getAllVectorStores() {
  return await VectorStores.find({isDeleted: {$ne: true}})
      .populate('vsFiles', 'fileName openaiId createdAt fileSize');
}

/**
 * Update an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} - Updated assistant or null
 */
async function updateAssistant({assistantId, name, description, instructions, model, vectorStoreId}) {
  return await Assistants.findOneAndUpdate({openaiId: assistantId},
      {name, description, instructions, model, vectorStoreId}, {new: true});
}
async function updateVectorStore({vectorStoreId, name, description}) {
  return await VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {name, description}, {new: true});
}

/**
 * Delete an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Deleted assistant or null
 */
async function deleteAssistant({assistantId}) {
  return await Assistants.findOneAndUpdate({openaiId: assistantId}, {isDeleted: true});
}
async function deleteVectorStore({vectorStoreId}) {
  return await VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {isDeleted: true});
}
async function deleteFile({vectorStoreId, fileId}) {
  await Promise.all([
    VSFiles.findOneAndUpdate({openaiId: fileId}, {isDeleted: true}),
    VectorStores.findOneAndUpdate({openaiId: vectorStoreId}, {$pull: {files: fileId}}),
  ]);
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
};
