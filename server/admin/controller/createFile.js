const sanitize = require('sanitize-filename');
const {createFile: createFileS3Helper} = require('../../../helpers/s3Helpers');
const {uploadFileToOpenAI, addFileToVectorStore /* waitForVectorStoreFileReady*/} = require('../../../helpers/openAI');
const {createFile: createFileDBInteraction} = require('../dbInteractions');

async function createFile({file, body: {vectorStoreId}}, res) {
  if (!file || !file.buffer || !file.originalname || !file.size || !vectorStoreId ) {
    return res.status(400).json({error: 'No file uploaded'});
  }
  const {buffer: fileContent, size: fileSize, originalName: rawName} = file;
  // 1) sanitize the incoming filename
  const fileName = sanitize(rawName) || `${Date.now()}`;
  const openaiId = await uploadFileToOpenAI({buffer: file.buffer, fileName});
  // await waitForVectorStoreFileReady({fileId: openaiId, vectorStoreId});
  await Promise.all([
    await addFileToVectorStore({fileId: openaiId, vectorStoreId}),
    createFileDBInteraction({fileName, openaiId, vectorStoreId, fileSize}),
    createFileS3Helper({
      folderName: vectorStoreId,
      fileName,
      fileContent}),
  ]);

  return res.status(200).json({message: 'File uploaded successfully'});
}

module.exports = {createFile};
