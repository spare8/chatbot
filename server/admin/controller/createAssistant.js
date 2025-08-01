const {createAssistant: createAssistantDBInteraction} = require('../dbInteractions');
const {createAssistant2: createAssistantOpenaiHelper} = require('../../../helpers/openAI');

async function createAssistant({body: {instructions, name, description, model}}, res) {
  if (!name || !instructions) {
    return res.status(400).json({error: 'Name and instructions are required'});
  }

  const openaiId = await createAssistantOpenaiHelper({
    instructions, name, description, model,
  });

  const newAssistant = await createAssistantDBInteraction({
    name, instructions, description, model, openaiId,
  });

  res.status(200).json(newAssistant);
}

module.exports = {
  createAssistant,
};
