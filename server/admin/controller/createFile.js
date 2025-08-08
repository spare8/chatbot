// server/admin/controller/deleteFile.js
const {
  deleteFile: deleteFileDBInteraction,
  getFileById
} = require('../dbInteractions');
const {
  deleteFileById,
  deleteFileFromVectorStore
} = require('../../../helpers/openAI');
const {
  deleteFile: deleteFileS3Helper
} = require('../../../helpers/s3Helpers');

async function deleteFile(req, res) {
  try {
    // 1) Extract from body
    const { fileId, vectorStoreId } = req.body;

    // 2) Validate inputs
    if (!fileId || !vectorStoreId) {
      return res
        .status(400)
        .json({ error: 'Insufficient Params to delete a file' });
    }

    // 3) Lookup the DB record so we know the original filename on S3
    const fileRecord = await getFileById({ fileId });
    if (!fileRecord) {
      return res
        .status(404)
        .json({ error: `No file record found for ID ${fileId}` });
    }
    const { fileName } = fileRecord;

    // 4) Do everything in parallel
    await Promise.all([
      // remove the DB entry & pull from vectorStore.files[]
      deleteFileDBInteraction({ vectorStoreId, fileId }),

      // remove from OpenAI’s file store
      deleteFileById({ fileId }),

      // un‐link from the OpenAI vector store
      deleteFileFromVectorStore({ vectorStoreId, fileId }),

      // delete the S3 object under `${vectorStoreId}/${fileName}`
      deleteFileS3Helper({ folderName: vectorStoreId, fileName }),
    ]);

    // 5) Success
    return res
      .status(200)
      .json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('deleteFile error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Internal server error' });
  }
}

module.exports = { deleteFile };
