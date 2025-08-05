// const {createAssistant: createAssistantDBInteraction} = require('../dbInteractions');
// const {createAssistant2: createAssistantOpenaiHelper} = require('../../../helpers/openAI');

// async function createAssistant({body: {instructions, name, description, model}}, res) {
//   if (!name || !instructions) {
//     return res.status(400).json({error: 'Name and instructions are required'});
//   }

//   const openaiId = await createAssistantOpenaiHelper({
//     instructions, name, description, model,
//   });

//   const newAssistant = await createAssistantDBInteraction({
//     name, instructions, description, model, openaiId,
//   });

//   res.status(200).json(newAssistant);
// }

// module.exports = {
//   createAssistant,
// };

// server/controllers/createAssistant.js
const {createAssistant: createAssistantDBInteraction} = require('../dbInteractions');
const {createAssistant2: createAssistantOpenaiHelper} = require('../../../helpers/openAI');

async function createAssistant(req, res) {
  try {
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
    if (!openaiId) {
      throw new Error('OpenAI did not return an assistant ID');
    }

    // Persist the assistant in MongoDB
    const newAssistant = await createAssistantDBInteraction({
      name,
      instructions,
      description,
      model,
      openaiId,
      tools,
      toolResources: tool_resources,
    });

    // Respond with the created assistant
    return res.status(200).json(newAssistant);
  } catch (err) {
    console.error('createAssistant error:', err);
    return res.status(500).json({error: err.message});
  }
}

module.exports = {createAssistant};

