// server/controllers/deleteAssistant.js
const {deleteAssistant: deleteAssistantDBInteraction} = require('../dbInteractions');
const {deleteAssistant: deleteAssistantOpenaiHelper} = require('../../../helpers/openAI');

/**
 * Delete an existing assistant on OpenAI and soft-delete in MongoDB
 * Expects assistantId as a URL param
 */
async function deleteAssistant({body: {assistantId}}, res) {
  if (!assistantId) {
    return res.status(400).json({error: 'assistantId is required'});
  }

  // 1) Delete assistant on OpenAI side
  await deleteAssistantOpenaiHelper({assistantId});

  // 2) Soft-delete in MongoDB (sets isDeleted=true)
  await deleteAssistantDBInteraction({assistantId});

  // Respond with the soft-deleted assistant
  return res.status(200).json({message: 'Assistant deleted successfully'});
}

module.exports = {deleteAssistant};
