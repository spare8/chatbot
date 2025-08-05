// server/dbInteractions/assistantDb.js
const Assistants = require('../../models/assistant');
const VectorStores = require('../../models/vectorStore');

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

/**
 * Retrieve a single assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Found assistant or null
 */
async function getAssistantById({assistantId}) {
  return await Assistants.findById(assistantId);
}

/**
 * Retrieve all assistants
 * @returns {Promise<Array>} - Array of assistant documents
 */
async function getAllAssistants() {
  return await Assistants.find({isDeleted: {$ne: true}});
}

/**
 * Update an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} - Updated assistant or null
 */
async function updateAssistant({assistantId, name, description, instructions, model, vectorStoreId}) {
  return await Assistants.findByIdAndUpdate(assistantId, {name, description, instructions, model, vectorStoreId}, {new: true});
}

/**
 * Delete an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Deleted assistant or null
 */
async function deleteAssistant({assistantId}) {
  return await Assistants.findByIdAndUpdate(assistantId, {isDeleted: true});
}

async function createVectorStore({name, openaiId, description, maxChunkOverlap, maxChunkSize}) {
  if (!name || !description || !openaiId || !maxChunkOverlap || !maxChunkSize) {
    throw new Error('Insufficient Params to create a vector store');
  }
  return await VectorStores.create({name, openaiId, description, maxChunkOverlap, maxChunkSize});
}

module.exports = {
  createAssistant,
  getAssistantById,
  getAllAssistants,
  updateAssistant,
  deleteAssistant,
  createVectorStore,
};
