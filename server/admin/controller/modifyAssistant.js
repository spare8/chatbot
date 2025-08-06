const {updateAssistant: updateAssistantDBInteraction} = require('../dbInteractions');
const {modifyAssistant2: modifyAssistantOpenaiHelper} = require('../../../helpers/openAI');

/**
 * Update an existing assistant on OpenAI and MongoDB
 * Expects assistantId and updated fields in the request body
 */
async function updateAssistant(req, res) {
  const {
    assistantId,
    name,
    instructions,
    description = '',
    model,
    tools = [],
    tool_resources = {},
    vectorStoreIds = [],
    metadata = {},
  } = req.body;

  // 1) Validate required fields
  if (!assistantId) {
    return res.status(400).json({error: 'assistantId is required in the request body'});
  }
  if (!name || !instructions || !model) {
    return res
        .status(400)
        .json({error: 'assistantId, name, instructions, and model are required'});
  }

  // 2) Build final tools array and resources
  const finalTools = Array.isArray(tools) ? [...tools] : [];
  const finalResources = {...tool_resources};

  if (vectorStoreIds.length > 0) {
    if (!finalTools.some((t) => t.type === 'file_search')) {
      finalTools.push({type: 'file_search'});
    }
    finalResources.file_search = {vector_store_ids: vectorStoreIds};
  }

  // 3) Push update to OpenAI
  const openaiResult = await modifyAssistantOpenaiHelper({
    assistantId,
    name,
    instructions,
    description,
    model,
    tools: finalTools,
    tool_resources: finalResources,
    metadata,
  });
  if (!openaiResult) {
    throw new Error('OpenAI modifyAssistant2 did not return data');
  }

  // 4) Persist update in MongoDB
  const updatedAssistant = await updateAssistantDBInteraction({
    assistantId,
    name,
    instructions,
    description,
    model,
    tools: finalTools,
    toolResources: finalResources,
    vectorStores: vectorStoreIds,
    metadata,
  });

  // 5) Respond
  return res.status(200).json(updatedAssistant);
}

module.exports = {updateAssistant};
