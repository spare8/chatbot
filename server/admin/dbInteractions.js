// server/dbInteractions/assistantDb.js
const Assistants = require('../../models/assistant');

/**
 * Create a new assistant
 * @param {Object} data - Assistant properties
 * @returns {Promise<Object>} - Created assistant document
 */
function createAssistant({name, description, instructions, model, vectorStoreId, openaiId}) {
  if (!name || !model || !openaiId) {
    throw new Error('Name and model are required to create an assistant');
  }
  return Assistants.create({
    name, description, instructions, model, vectorStoreId, openaiId,
  });
}

/**
 * Retrieve a single assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Found assistant or null
 */
function getAssistantById({assistantId}) {
  return Assistants.findById(assistantId);
}

/**
 * Retrieve all assistants
 * @returns {Promise<Array>} - Array of assistant documents
 */
function getAllAssistants() {
  return Assistants.find({isDeleted: {$ne: true}});
}

/**
 * Update an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} - Updated assistant or null
 */
function updateAssistant({assistantId, name, description, instructions, model, vectorStoreId}) {
  return Assistants.findByIdAndUpdate(assistantId, {name, description, instructions, model, vectorStoreId}, {new: true});
}

/**
 * Delete an assistant by ID
 * @param {String} id - Assistant ObjectId
 * @returns {Promise<Object|null>} - Deleted assistant or null
 */
function deleteAssistant({assistantId}) {
  return Assistants.findByIdAndUpdate(assistantId, {isDeleted: true});
}

module.exports = {
  createAssistant,
  getAssistantById,
  getAllAssistants,
  updateAssistant,
  deleteAssistant,
};
