// server/controllers/createAssistant.js
const {createAssistant: createAssistantDBInteraction} = require('../dbInteractions');
const {createAssistant2: createAssistantOpenaiHelper} = require('../../../helpers/openAI');

async function createAssistant(req, res) {
  // Destructure incoming request body
  const {
    name,
    instructions,
    description = '',
    model,
    tools = [],
    tool_resources = {},
  } = req.body;

  // Validate required fields
  if (!name || !instructions || !model) {
    return res.status(400).json({error: 'Name, instructions, and model are required'});
  }

  // Call OpenAI to create the assistant
  const openaiId = await createAssistantOpenaiHelper({
    name,
    instructions,
    description,
    model,
    tools,
    tool_resources,
  });

  // Persist the assistant in MongoDB
  const newAssistant = await createAssistantDBInteraction({
    name,
    instructions,
    description,
    model,
    openaiId,
    tools,
    toolResources: tool_resources,
    temperature
  });

  // Respond with the created assistant
  return res.status(200).json(newAssistant);
}

module.exports = {createAssistant};

