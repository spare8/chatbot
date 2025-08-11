// server/admin/controller/assistants/linkAssistantToVS.js
const Assistants = require('../../../../models/assistant');
const { updateAssistant: updateAssistantDB } = require('../../dbInteractions');
const { linkVectorStore: linkVSOnOpenAI } = require('../../../../helpers/openAI');

async function linkAssistantToVS(req, res) {
  try {
    const assistantId   = (req.body.assistantId || req.body.assistantOpenAIId || '').trim();
    const vectorStoreId = (req.body.vectorStoreId || req.body.vectorStoreOpenAIId || '').trim();

    if (!assistantId || !vectorStoreId) {
      return res.status(400).json({ error: 'assistantId and vectorStoreId are required' });
    }

    // FIX: pass an object, not positional args
    const oa = await linkVSOnOpenAI({ assistantId, vectorStoreId });
    if (!oa) return res.status(502).json({ error: 'Failed to update assistant on OpenAI' });

    const doc = await Assistants.findOne({ openaiId: assistantId }, { tools: 1, toolResources: 1 }).lean();
    if (!doc) return res.status(404).json({ error: 'Assistant not found' });

    const tools = Array.isArray(doc.tools) ? doc.tools : [];
    const hasFS = tools.some(t => t?.type === 'file_search');
    const finalTools = hasFS ? tools : [...tools, { type: 'file_search' }];

    const existingTR = doc.toolResources instanceof Map
      ? Object.fromEntries(doc.toolResources)
      : (doc.toolResources || {});
    const finalToolResources = { ...existingTR, file_search: { vector_store_ids: [vectorStoreId] } };

    const db = await updateAssistantDB({
      assistantId,
      vectorStoreId,
      tools: finalTools,
      toolResources: finalToolResources,
    });

    return res.status(200).json(db);
  } catch (err) {
    console.error('linkAssistantToVS error:', err);
    return res.status(500).json({ error: 'Failed to link vector store' });
  }
}

module.exports = { linkAssistantToVS };
