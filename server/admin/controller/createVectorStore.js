const {createVectorStore: createVectorStoreDbInteraction} = require('../dbInteractions');
const {createVectorStore: createVectorStoreOpenAI} = require('../../../helpers/openAI');
const {createFolder} = require('../../../helpers/s3Helpers');

async function createVectorStore({body: {name, description,
  maxChunkSize = 300, maxChunkOverlap = 40}}, res) {
  if (!name || !description) {
    return res.status(400).json({error: 'Name and description are required'});
  }
  const openaiId = await createVectorStoreOpenAI({name, description, maxChunkSize, maxChunkOverlap});
  await createVectorStoreDbInteraction({name, description, maxChunkSize, maxChunkOverlap, openaiId});
  await createFolder({folderName: openaiId});
  return res.status(200).json({message: 'Vector store created successfully', openaiId});
}

module.exports = {
  createVectorStore,
};
