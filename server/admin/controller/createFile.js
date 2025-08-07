const sanitize = require('sanitize-filename');
const {createFile: createFileS3Helper} = require('../../../helpers/s3Helpers');
const {uploadFileToOpenAI, addFileToVectorStore} = require('../../../helpers/openAI');
const {createFile: createFileDBInteraction} = require('../dbInteractions');

async function createFile({file, body: {vectorStoreId}}, res) {
  if (!file || !file.buffer || !file.originalname || !vectorStoreId) {
    return res.status(400).json({error: 'No file uploaded'});
  }
  const fileContent = file.buffer;

  // 1) sanitize the incoming filename
  const raw = file.originalname;
  const fileName = sanitize(raw) || `${Date.now()}`;
  const openaiId = await uploadFileToOpenAI({buffer: file.buffer, fileName});
  await addFileToVectorStore({fileId: openaiId, vectorStoreId});
  await Promise.all([
    createFileDBInteraction({fileName, openaiId, vectorStoreId}),
    createFileS3Helper({
      folderName: vectorStoreId,
      fileName,
      fileContent}),
  ]);

  return res.status(200).json({message: 'File uploaded successfully'});
}

module.exports = {createFile};
