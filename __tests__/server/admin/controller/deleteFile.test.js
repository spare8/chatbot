const {MockResponse} = require('../../../setupTests');
const {deleteFile} = require('../../../../server/admin/controller/deleteFile');
const {deleteFile: deleteFileS3Helper} = require('../../../../helpers/s3Helpers');
const {deleteFileById, deleteFileFromVectorStore} = require('../../../../helpers/openAI');
const {deleteFile: deleteFileDBInteraction} = require('../../../../server/admin/dbInteractions');

jest.mock('../../../../helpers/s3Helpers', () => ({
  deleteFile: jest.fn(),
}));

jest.mock('../../../../helpers/openAI', () => ({
  deleteFileById: jest.fn(),
  deleteFileFromVectorStore: jest.fn(),
}));

jest.mock('../../../../server/admin/dbInteractions', () => ({
  deleteFile: jest.fn(),
}));

const fileId = 'testFileId';
const vectorStoreId = 'testVectorStoreId';
describe('deleteFile controller', () => {
  let res; let req;
  beforeEach(() => {
    res = MockResponse();
    req = {
      body: {vectorStoreId, fileId},
    };
  });
  it('should return 400 if fileId or vectorStoreId is missing', async () => {
    req.body.fileId = null;
    await deleteFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Insufficient Params to delete a file'});
  });
  it('should return 400 if fileId or vectorStoreId is missing', async () => {
    req.body.vectorStoreId = null;
    await deleteFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Insufficient Params to delete a file'});
  });
  it('should delete a file successfully', async () => {
    await deleteFile(req, res);

    expect(deleteFileDBInteraction).toHaveBeenCalledWith({vectorStoreId, fileId});
    expect(deleteFileById).toHaveBeenCalledWith({fileId});
    expect(deleteFileFromVectorStore).toHaveBeenCalledWith({vectorStoreId, fileId});
    expect(deleteFileS3Helper).toHaveBeenCalledWith({fileName: fileId, folderName: vectorStoreId});

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({message: 'File deleted successfully'});
  });
});
