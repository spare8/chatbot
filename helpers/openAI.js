const axios = require('axios');
const {OPEN_AI_API_TOKEN} = require('../config/config');
const fs = require('fs');

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


async function createVectorStore({VSName}) {
  if (!VSName) {
    throw new Error('Vector store name is required');
  }

  const payload = {
    name: VSName,
    description: 'Vector store with optimized static chunking',
    chunking_strategy: {
      type: 'static',
      static: {
        max_chunk_size_tokens: 300,
        chunk_overlap_tokens: 40,
      },
    },
  };

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/vector_stores',
        payload,
        {headers: openAPIHeaders},
    );
    return response.data.id;
  } catch (err) {
    console.error('Error creating vector store:', err.response?.data || err.message);
  }

  return null;
}


async function listVectorStores(limit = 20) {
  try {
    const response = await axios.get(
        `https://api.openai.com/v1/vector_stores?limit=${limit}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing vector stores:', err.response?.data || err.message);
  }

  return null;
}

async function modifyVectorStore(vectorStoreId, metadata) {
  if (!vectorStoreId || !metadata) {
    throw new Error('vectorStoreId and metadata are required to modify a vector store');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/vector_stores/${vectorStoreId}`,
        {metadata},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying vector store:', err.response?.data || err.message);
  }

  return null;
}

async function deleteVectorStore({vectorStoreId}) {
  if (!vectorStoreId) {
    throw new Error('vectorStoreId is required to delete a vector store');
  }

  const response = await axios.delete(
      `https://api.openai.com/v1/vector_stores/${vectorStoreId}`,
      {headers: openAPIHeaders},
  );
  return response.data;
}

async function searchVectorStoreFiles(vectorStoreId) {
  if (!vectorStoreId) {
    throw new Error('vectorStoreId is required to list files in a vector store');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing vector store files:', err.response?.data || err.message);
  }

  return null;
}

/**
 * Upload a file to OpenAI, from disk *or* from an in-memory Buffer.
 *
 * @param {Object}   params
 * @param {string}  [params.filePath]  – path on disk to stream
 * @param {Buffer}  [params.buffer]    – raw file buffer (from multer)
 * @param {string}  [params.filename]  – required if using buffer
 */
async function uploadFileToOpenAI({ filePath, buffer, fileName }) {
  const formData = new FormData();

  if (buffer) {
    if (!fileName) throw new Error('Must pass fileName when uploading from buffer');
    // <Buffer> + fileName instructs FormData to treat it like a file
    formData.append('file', buffer, { fileName });
  } else if (filePath) {
    formData.append('file', fs.createReadStream(filePath));
  } else {
    throw new Error('Must provide either filePath or buffer');
  }

  formData.append('purpose', 'assistants');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/files',
      formData,
      {
        headers: {
          ...openAPIHeaders,
          ...formData.getHeaders(),
        },
      }
    );
    return response.data.id;
  } catch (err) {
    console.error('Error uploading file:', err.response?.data || err.message);
    return null;
  }
}

async function listAllFiles() {
  try {
    const response = await axios.get(
        'https://api.openai.com/v1/files',
        {headers: openAPIHeaders},
    );
    return response.data.data;
  } catch (err) {
    console.error('Error listing files:', err.response?.data || err.message);
  }

  return [];
}

async function retrieveFileById(fileId) {
  if (!fileId) {
    throw new Error('fileId is required to retrieve a file');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/files/${fileId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving file:', err.response?.data || err.message);
  }

  return null;
}

async function deleteFileById({fileId}) {
  if (!fileId) {
    throw new Error('fileId is required to delete a file');
  }

  try {
    const response = await axios.delete(
        `https://api.openai.com/v1/files/${fileId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error deleting file:', err.response?.data || err.message);
  }

  return null;
}

async function deleteFileFromVectorStore({fileId, vectorStoreId}) {
  if (!fileId || !vectorStoreId) {
    throw new Error('fileId and vectorStoreId are required to delete file from vector store');
  }

  try {
    const response = await axios.delete(
        `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files/${fileId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error deleting file from vector store:', err.response?.data || err.message);
  }

  return null;
}

async function addFileToVectorStore({fileId, vectorStoreId}) {
  if (!fileId || !vectorStoreId) {
    throw new Error('Both fileId and vectorStoreId are required');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
        {file_id: fileId},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error adding file to vector store:', err.response?.data || err.message);
  }

  return null;
}

async function createRun({threadId, assistantId}) {
  if (!threadId || !assistantId) {
    throw new Error('Both threadId and assistantId are required to create a run');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {assistant_id: assistantId},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating run:', err.response?.data || err.message);
  }

  return null;
}

async function createThreadAndRun({assistantId, messages}) {
  if (!assistantId || !Array.isArray(messages)) {
    throw new Error('assistantId and messages array are required to create thread and run');
  }

  const formattedMessages = messages.map((content) => ({
    role: 'user',
    content,
  }));

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/threads/runs',
        {
          assistant_id: assistantId,
          thread: {messages: formattedMessages},
        },
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating thread and run:', err.response?.data || err.message);
  }

  return null;
}

async function listRuns(threadId) {
  if (!threadId) {
    throw new Error('threadId is required to list runs');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing runs:', err.response?.data || err.message);
  }

  return null;
}

async function retrieveRun(threadId, runId) {
  if (!threadId || !runId) {
    throw new Error('threadId and runId are required to retrieve a run');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving run:', err.response?.data || err.message);
  }

  return null;
}

async function modifyRun(threadId, runId, metadata) {
  if (!threadId || !runId || !metadata) {
    throw new Error('threadId, runId, and metadata are required to modify a run');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {metadata},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying run:', err.response?.data || err.message);
  }

  return null;
}

async function submitToolOutputs(threadId, runId, toolOutputs) {
  if (!threadId || !runId || !Array.isArray(toolOutputs)) {
    throw new Error('threadId, runId, and toolOutputs array are required to submit tool outputs');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`,
        {tool_outputs: toolOutputs},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error submitting tool outputs:', err.response?.data || err.message);
  }

  return null;
}

async function cancelRun(threadId, runId) {
  if (!threadId || !runId) {
    throw new Error('threadId and runId are required to cancel a run');
  }

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/cancel`,
        {},
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error canceling run:', err.response?.data || err.message);
  }

  return null;
}

async function listRunSteps(threadId, runId) {
  if (!threadId || !runId) {
    throw new Error('threadId and runId are required to list run steps');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error listing run steps:', err.response?.data || err.message);
  }

  return null;
}

async function retrieveRunStep(threadId, runId, stepId) {
  if (!threadId || !runId || !stepId) {
    throw new Error('threadId, runId, and stepId are required to retrieve a run step');
  }

  try {
    const response = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps/${stepId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error retrieving run step:', err.response?.data || err.message);
  }

  return null;
}

async function createAssistant2({
  instructions,
  name,
  description = '',
  tools = [],
  model = 'gpt-3.5-turbo',
  tool_resources,
  metadata = {},
}) {
  if (!instructions || !name || !Array.isArray(tools)) {
    throw new Error('insufficient or invalid params passed to create a new assistant');
  }

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/assistants',
        {
          instructions,
          name,
          model,
          tools,
          ...(description && {description}),
          ...(tool_resources && {tool_resources}),
          ...(metadata && Object.keys(metadata).length > 0 && {metadata}),
        },
        {headers: openAPIHeaders},
    );
    return response.data.id;
  } catch (err) {
    console.error('Error creating assistant:', err.response?.data || err.message);
  }

  return null;
}


async function createRunWithOptions(threadId, {
  assistant_id,
  model,
  instructions,
  tools,
  metadata,
  temperature,
  stream,
  max_tokens,
  stop,
  response_format,
  tool_choice,
  logprobs,
  top_logprobs,
}) {
  if (!threadId || !assistant_id) {
    throw new Error('Both threadId and assistant_id are required to create a run');
  }

  const payload = {
    assistant_id,
    ...(model && {model}),
    ...(instructions && {instructions}),
    ...(tools && {tools}),
    ...(metadata && {metadata}),
    ...(typeof temperature !== 'undefined' && {temperature}),
    ...(typeof stream !== 'undefined' && {stream}),
    // ...(typeof max_tokens !== 'undefined' && max_tokens {max_tokens:Math.min(max_tokens, 1024)}),
    ...(typeof max_tokens !== 'undefined' && {max_tokens}),
    ...(stop && {stop}),
    ...(response_format && {response_format}),
    ...(tool_choice && {tool_choice}),
    ...(typeof logprobs !== 'undefined' && {logprobs}),
    ...(typeof top_logprobs !== 'undefined' && {top_logprobs}),
  };

  try {
    const response = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        payload,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error creating run with options:', err.response?.data || err.message);
  }

  return null;
}

async function createThreadAndRunWithOptions({
  assistant_id,
  thread, // { messages: [...] }
  model,
  instructions,
  tools,
  metadata,
  temperature,
  top_p, // ← NEW!
  stream,
  max_tokens,
  stop,
  response_format,
  tool_choice,
  logprobs,
  top_logprobs,
}) {
  if (!assistant_id) {
    throw new Error('assistant_id is required to create thread and run');
  }

  const payload = {
    assistant_id,
    ...(thread && {thread}),
    ...(model && {model}),
    ...(instructions && {instructions}),
    ...(tools && {tools}),
    ...(metadata && {metadata}),
    ...(typeof temperature !== 'undefined' && {temperature}),
    ...(typeof top_p !== 'undefined' && {top_p}), // ← include top_p
    ...(typeof stream !== 'undefined' && {stream}),
    ...(typeof max_tokens !== 'undefined' && {max_tokens: Math.min(max_tokens, 1024)}),
    ...(stop && {stop}),
    ...(response_format && {response_format}),
    ...(tool_choice && {tool_choice}),
    ...(typeof logprobs !== 'undefined' && {logprobs}),
    ...(typeof top_logprobs !== 'undefined' && {top_logprobs}),
  };

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/threads/runs',
        payload,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error(
        'Error creating thread and run with options:',
        err.response?.data || err.message,
    );
  }
  return null;
}

async function deleteAssistant({assistantId}) {
  if (!assistantId) {
    throw new Error('assistantId is required');
  }
  const response = await axios.delete(
      `https://api.openai.com/v1/assistants/${assistantId}`,
      {headers: openAPIHeaders},
  );
  return response.data;
}

async function deleteThread(threadId) {
  if (!threadId) {
    throw new Error('threadId is required');
  }
  try {
    const response = await axios.delete(
        `https://api.openai.com/v1/threads/${threadId}`,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error deleting thread:', err.response?.data || err.message);
    return null;
  }
}

async function modifyAssistant2({assistantId, name, instructions, description = '', tools = [], model = 'gpt-3.5-turbo', tool_resources = {}, metadata = {}}) {
  if (!assistantId) {
    throw new Error('assistantId is required');
  }
  if (!name || !instructions || !Array.isArray(tools)) {
    throw new Error('Insufficient or invalid params');
  }

  const payload = {
    ...(name && {name}),
    ...(instructions && {instructions}),
    ...(model && {model}),
    ...(description && {description}),
    ...(tools && {tools}),
    ...(tool_resources && {tool_resources}),
    ...(metadata && Object.keys(metadata).length && {metadata}),
  };

  try {
    // Use POST instead of PATCH
    const response = await axios.post(
        `https://api.openai.com/v1/assistants/${assistantId}`,
        payload,
        {headers: openAPIHeaders},
    );
    return response.data;
  } catch (err) {
    console.error('Error modifying assistant:', err.response?.data || err.message);
    return null;
  }
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
  createVectorStore,
  listVectorStores,
  modifyVectorStore,
  deleteVectorStore,
  searchVectorStoreFiles,
  uploadFileToOpenAI,
  listAllFiles,
  retrieveFileById,
  deleteFileById,
  deleteFileFromVectorStore,
  addFileToVectorStore,
  createRun,
  createThreadAndRun,
  listRuns,
  retrieveRun,
  modifyRun,
  submitToolOutputs,
  cancelRun,
  listRunSteps,
  retrieveRunStep,
  createAssistant2,
  createRunWithOptions,
  createThreadAndRunWithOptions,
  deleteAssistant,
  deleteThread,
  modifyAssistant2,


};
