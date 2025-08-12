// server/admin/controller/assistants/unlinkAssistantFromVS.js
const {updateAssistant: updateAssistantDB, getAssistantById} = require('../../dbInteractions');
const {modifyAssistant2} = require('../../../../helpers/openAI');
async function unlinkAssistantFromVS(req, res) {
  try {
    const assistantId = (req.body.assistantId || req.body.assistantOpenAIId || '').trim();
    if (!assistantId) {
      return res.status(400).json({error: 'assistantId is required'});
    }

    // 1) Load from DB so we can send required fields to modifyAssistant2
    const doc = await getAssistantById({assistantId});
    if (!doc) {
      return res.status(404).json({error: 'Assistant not found'});
    }

    // 2) Build tools WITHOUT file_search
    const existingTools = Array.isArray(doc.tools) ? doc.tools : [];
    const oaTools = existingTools.filter((t) => t?.type !== 'file_search');

    // 3) OpenAI: remove file_search + clear vector_store_ids
    const oa = await modifyAssistant2({
      assistantId,
      name: doc.name,
      instructions: doc.instructions || '',
      description: doc.description || '',
      model: doc.model,
      tools: oaTools,
      tool_resources: {file_search: {vector_store_ids: []}}, // clear all VS links
      metadata: doc.metadata || {},
    });
    if (!oa) {
      return res.status(502).json({error: 'Failed to update assistant on OpenAI'});
    }

    // 4) DB: clear vectorStoreId and remove file_search resources
    const existingTR = (doc.toolResources instanceof Map) ?
      Object.fromEntries(doc.toolResources) :
      (doc.toolResources || {});
    delete existingTR.file_search;

    const updated = await updateAssistantDB({
      assistantId,
      vectorStoreId: null,
      tools: oaTools,
      toolResources: existingTR,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('unlinkAssistantFromVS error:', err);
    return res.status(500).json({error: 'Failed to unlink vector store'});
  }
}

module.exports = {unlinkAssistantFromVS};
