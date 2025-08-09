const {streamFileToResponse} = require('../../../../helpers/s3Helpers');

// Get file from s3, and stream the output to response
function getFile({body: {vectorStoreId, fileId}}, res) {
  if (!vectorStoreId || !fileId) {
    return res.status(400).json({error: 'Insufficient Params to get a file'});
  }
  return streamFileToResponse(
      {folderName: vectorStoreId, fileName: fileId, res});
}
module.exports = {getFile};
