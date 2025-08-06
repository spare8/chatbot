// server/controllers/deleteAssistant.js
const {deleteVectorStore: deleteVSDBInteraction} = require('../dbInteractions');
const {deleteVectorStore: deleteVectorStoreOpenaiHelper} = require('../../../helpers/openAI');
const {deleteFolder} = require('../../../helpers/s3Helpers');


async function deleteVectorStore({body: {vectorStoreId}}, res) {
  if (!vectorStoreId) {
    return res.status(400).json({error: 'vectorStoreId is required'});
  }

  // 1) Delete assistant on OpenAI side
  await deleteVectorStoreOpenaiHelper({vectorStoreId});

  // 2) Soft-delete in MongoDB (sets isDeleted=true)
  await deleteVSDBInteraction({vectorStoreId});
  await deleteFolder({folderName: vectorStoreId});

  // Respond with the soft-deleted assistant
  return res.status(200).json({message: 'Assistant deleted successfully'});
}

module.exports = {deleteVectorStore};
