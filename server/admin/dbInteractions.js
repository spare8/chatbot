// server/dbInteractions/assistantDb.js
const Assistants = require('../../models/assistant');
const VectorStores = require('../../models/vectorStore');
const VSFiles = require('../../models/VSFile');

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
  toolResources,   // <-- note: DB field is camelCase
  metadata,
  isDeleted,
}) {
  // Build a $set object with only defined keys
  const payload = {};
  const addIfDefined = (k, v) => { if (v !== undefined) payload[k] = v; };

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
    { openaiId: assistantId },
    { $set: payload },
    { new: true, runValidators: true }
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
