const {updateAssistant: updateAssistantDB, getAssistantById} =
  require('../../dbInteractions');
const {modifyAssistant2} =
  require('../../../../helpers/openAI');

async function unlinkAssistantFromVS(req, res) {
  const assistantId =
    (req.body.assistantId || req.body.assistantOpenAIId || '').trim();

  if (!assistantId) {
    const err = new Error('assistantId is required');
    err.status = 400;
    throw err;
  }

  const doc = await getAssistantById({assistantId});
  if (!doc) {
    const err = new Error('Assistant not found');
    err.status = 404;
    throw err;
  }

  const existingTools = Array.isArray(doc.tools) ? doc.tools : [];
  const oaTools = existingTools.filter((t) => t?.type !== 'file_search');

  const oa = await modifyAssistant2({
    assistantId,
    name: doc.name,
    instructions: doc.instructions || '',
    description: doc.description || '',
    model: doc.model,
    tools: oaTools,
    tool_resources: {file_search: {vector_store_ids: []}},
    metadata: doc.metadata || {},
  });

  if (!oa) {
    const err = new Error('Failed to update assistant on OpenAI');
    err.status = 502;
    throw err;
  }

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

  res.status(200).json(updated);
}

module.exports = {unlinkAssistantFromVS};
