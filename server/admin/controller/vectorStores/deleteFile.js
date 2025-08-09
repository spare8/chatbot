const {deleteFile: deleteFileDBInteraction} = require('../../dbInteractions');
const {deleteFileById, deleteFileFromVectorStore} = require('../../../../helpers/openAI');
const {deleteFile: deleteFileS3Helper} = require('../../../../helpers/s3Helpers');

async function deleteFile({body: {fileId, vectorStoreId}}, res) {
  if (!fileId || !vectorStoreId) {
    return res.status(400).json({error: 'Insufficient Params to delete a file'});
  }

  // 3) Perform deletions
  await Promise.all([
    deleteFileDBInteraction({vectorStoreId, fileId}),
    deleteFileById({fileId}),
    deleteFileFromVectorStore({vectorStoreId, fileId}),
    deleteFileS3Helper({fileName: fileId, folderName: vectorStoreId}),
  ]);

  // 4) Success
  return res.status(200).json({message: 'File deleted successfully'});
}

module.exports = {deleteFile};
