const axios = require('axios');
const {OPEN_AI_API_TOKEN} = require('../config/config');

const openAPIHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPEN_AI_API_TOKEN}`,
    'OpenAI-Beta': 'assistants=v2',
};

async function createAssistant({instructions, name, tools, model = 'gpt-3.5-turbo'}) {
  if (!instructions || !name || !model || !tools) {
    throw new Error('insufficient params passed to create a new assistant');
  }
  try {
    const response = await axios.post(
        'https://api.openai.com/v1/assistants',
        {
          instructions,
          name,
          tools,
          model,
        },
        {headers: openAPIHeaders},
    );
    return response.data.id;
  } catch (err) {
    console.error('Error creating assistant:', err.response ? err.response.data : err.message);
  }
  return null;
}

async function listAssistants() {
  try {
    const response = await axios.get(
        'https://api.openai.com/v1/assistants',
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing assistants:', err.response ? err.response.data : err.message);
  }
  return null;
}

async function retrieveAssistant({assistantId}) {
  if (!assistantId) {
    throw new Error('assistantId is required to retrieve an assistant');
  }
  try {
    const response = await axios.get(
        `https://api.openai.com/v1/assistants/${assistantId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving assistant:', err.response ? err.response.data : err.message);
  }
  return null;
}

async function modifyAssistant({assistantId, instructions, tools, model}) {
  if (!assistantId) {
    throw new Error('assistantId is required to modify an assistant');
  }
  try {
    const response = await axios.post(
        `https://api.openai.com/v1/assistants/${assistantId}`,
        {
          instructions, tools, model,
        },
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying assistant:', err.response ? err.response.data : err.message);
  }
  return null;
}

module.exports = {
  createAssistant,
  listAssistants,
  retrieveAssistant,
  modifyAssistant,
};
