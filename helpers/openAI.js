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

async function createThreadWithUserMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('You must provide an array of user messages');
  }

  const formattedMessages = messages.map((content) => ({
    role: 'user',
    content,
  }));

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/threads',
        {messages: formattedMessages},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating thread with user messages:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function createThread() {
  try {
    const response = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating thread:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function createThreadWithAssistantMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('You must provide an array of assistant messages');
  }

  const formattedMessages = messages.map((content) => ({
    role: 'assistant',
    content,
  }));

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/threads',
        {messages: formattedMessages},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating thread with assistant messages:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function retrieveThread(threadId) {
  if (!threadId) {
    throw new Error('threadId is required to retrieve a thread');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving thread:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function modifyThread(threadId, metadata) {
  if (!threadId || !metadata) {
    throw new Error('Both threadId and metadata are required to modify a thread');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}`,
        {metadata},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying thread:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function createUserMessage(threadId, content) {
  if (!threadId || !content) {
    throw new Error('Both threadId and content are required to create a user message');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          role: 'user',
          content,
        },
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating user message:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function createAssistantMessage(threadId, content) {
  if (!threadId || !content) {
    throw new Error('Both threadId and content are required to create an assistant message');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          role: 'assistant',
          content,
        },
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating assistant message:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function listMessagesInThread(threadId, limit = 30) {
  if (!threadId) {
    throw new Error('threadId is required to list messages');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/messages?limit=${limit}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing messages:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function retrieveMessage(threadId, messageId) {
  if (!threadId || !messageId) {
    throw new Error('Both threadId and messageId are required to retrieve a message');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving message:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function modifyMessage(threadId, messageId, metadata) {
  if (!threadId || !messageId || !metadata) {
    throw new Error('threadId, messageId, and metadata are required to modify a message');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`,
        {metadata},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying message:', err.response ? err.response.data : err.message);
  }

  return null;
}


async function deleteMessage(threadId, messageId) {
  if (!threadId || !messageId) {
    throw new Error('Both threadId and messageId are required to delete a message');
  }

  try {
    const response = await axios.delete(
        `https://api.openai.com/v1/threads/${threadId}/messages/${messageId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error deleting message:', err.response ? err.response.data : err.message);
  }

  return null;
}


module.exports = {
  createAssistant,
  listAssistants,
  retrieveAssistant,
  modifyAssistant,
  createThread,
  createThreadWithUserMessages,
  createThreadWithAssistantMessages,
  retrieveThread,
  modifyThread,
  createUserMessage,
  createAssistantMessage,
  listMessagesInThread,
  retrieveMessage,
  modifyMessage,
  deleteMessage,
};
