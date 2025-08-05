// server/controllers/deleteAssistant.js
const {deleteAssistant: deleteAssistantDBInteraction} = require('../dbInteractions');
const {deleteAssistant: deleteAssistantOpenaiHelper} = require('../../../helpers/openAI');

/**
 * Delete an existing assistant on OpenAI and soft-delete in MongoDB
 * Expects assistantId as a URL param
 */
async function deleteAssistant(req, res) {
  try {
    // Extract URL param
    const {assistantId} = req.params;
    if (!assistantId) {
      return res.status(400).json({error: 'assistantId URL parameter is required'});
    }

    // 1) Delete assistant on OpenAI side
    const openaiResult = await deleteAssistantOpenaiHelper({assistantId});
    if (!openaiResult) {
      throw new Error('OpenAI deleteAssistant2 did not return data');
    }

    // 2) Soft-delete in MongoDB (sets isDeleted=true)
    const deleted = await deleteAssistantDBInteraction({assistantId});
    if (!deleted) {
      return res.status(404).json({error: 'Assistant not found'});
    }

    // Respond with the soft-deleted assistant
    return res.status(200).json(deleted);
  } catch (err) {
    console.error('deleteAssistant error:', err);
    return res.status(500).json({error: err.message});
  }
}

module.exports = {deleteAssistant};
