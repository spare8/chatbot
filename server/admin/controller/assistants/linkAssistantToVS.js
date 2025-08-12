const {updateAssistant: updateAssistantDB, getAssistantById} =
  require('../../dbInteractions');
const {linkVectorStore: linkVSOnOpenAI} =
  require('../../../../helpers/openAI');

async function linkAssistantToVS(req, res) {
  const assistantId =
    (req.body.assistantId || req.body.assistantOpenAIId || '').trim();
  const vectorStoreId =
    (req.body.vectorStoreId || req.body.vectorStoreOpenAIId || '').trim();

  if (!assistantId || !vectorStoreId) {
    const err = new Error('assistantId and vectorStoreId are required');
    err.status = 400;
    throw err;
  }

  const oa = await linkVSOnOpenAI({assistantId, vectorStoreId});
  if (!oa) {
    const err = new Error('Failed to update assistant on OpenAI');
    err.status = 502;
    throw err;
  }

  const doc = await getAssistantById({assistantId});
  if (!doc) {
    const err = new Error('Assistant not found');
    err.status = 404;
    throw err;
  }

  const existingTools = Array.isArray(doc.tools) ? doc.tools : [];
  const hasFileSearch = existingTools.some((t) => t?.type === 'file_search');
  const finalTools = hasFileSearch ?
    existingTools :
    [...existingTools, {type: 'file_search'}];

  const existingTR = (doc.toolResources instanceof Map) ?
    Object.fromEntries(doc.toolResources) :
    (doc.toolResources || {});

  const finalToolResources = {
    ...existingTR,
    file_search: {vector_store_ids: [vectorStoreId]},
  };

  const updated = await updateAssistantDB({
    assistantId,
    vectorStoreId,
    tools: finalTools,
    toolResources: finalToolResources,
  });

  res.status(200).json(updated);
}

module.exports = {linkAssistantToVS};
