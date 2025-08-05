// server/controllers/updateAssistant.js
const {updateAssistant: updateAssistantDBInteraction} = require('../dbInteractions');
const {modifyAssistant2: modifyAssistantOpenaiHelper} = require('../../../helpers/openAI');

async function updateAssistant(
    {params: {assistantId}, body: {
      name,
      instructions,
      description = '',
      model,
      tools = [],
      tool_resources = {},
      vectorStoreIds = [],
      metadata = {},
    }},
    res,
) {
  // 1) Validate URL param
  if (!assistantId) {
    return res
        .status(400)
        .json({error: 'assistantId URL parameter is required'});
  }

  // 2) Validate required body fields
  if (!name || !instructions || !model) {
    return res
        .status(400)
        .json({error: 'Name, instructions, and model are required to update an assistant'});
  }

  // 3) Build final tools array and resources
  const finalTools = Array.isArray(tools) ? [...tools] : [];
  const finalResources = {...tool_resources};

  if (vectorStoreIds.length > 0) {
    if (!finalTools.some((t) => t.type === 'file_search')) {
      finalTools.push({type: 'file_search'});
    }
    finalResources.file_search = {vector_store_ids: vectorStoreIds};
  }

  // 4) Push update to OpenAI
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

  // 5) Persist update in MongoDB
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

  // 6) Respond
  return res.status(200).json(updatedAssistant);
}

module.exports = {updateAssistant};
