const {getFile} = require('../../../../server/admin/controller/getFile');
const {streamFileToResponse} = require('../../../../helpers/s3Helpers');
const {MockResponse} = require('../../../setupTests');

jest.mock('../../../../helpers/s3Helpers', () => ({
  streamFileToResponse: jest.fn(),
}));

const fileId = 'testFileId';
const vectorStoreId = 'testVectorStoreId';
describe('getFile', () => {
  let req; let res;
  beforeEach(()=> {
    res = MockResponse();
    req = {body: {fileId, vectorStoreId}};
  });
  it('should return an error if no fileId', async () => {
    req.body.fileId = null;
    await getFile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Insufficient Params to get a file'});
  });
  it('should return an error if no vectorStoreId', async () => {
    req.body.vectorStoreId = null;
    await getFile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Insufficient Params to get a file'});
  });
  it('should call streamFileToResponse with corrrect params', async () => {
    await getFile(req, res);
    expect(streamFileToResponse).toHaveBeenCalledWith({
      folderName: vectorStoreId, fileName: fileId, res});
  });
});
