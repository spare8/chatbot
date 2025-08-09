const {deleteVectorStore} = require('../../../../../server/admin/controller/vectorStores/deleteVectorStore');
const {deleteVectorStore: deleteVectorStoreDBInteraction} = require('../../../../../server/admin/dbInteractions');
const {deleteVectorStore: deleteVectorStoreOpenaiHelper} = require('../../../../../helpers/openAI');
const {deleteFolder} = require('../../../../../helpers/s3Helpers');
const {MockResponse} = require('../../../../setupTests');

jest.mock('../../../../../server/admin/dbInteractions', () => ({
  deleteVectorStore: jest.fn(),
}));
jest.mock('../../../../../helpers/openAI', () => ({
  deleteVectorStore: jest.fn(),
}));
jest.mock('../../../../../helpers/s3Helpers', () => ({
  deleteFolder: jest.fn(),
}));

const vectorStoreId = 'test-assistant-id';
describe('deleteVectorStore', () => {
  let res; let req;

  beforeEach(() => {
    res = new MockResponse();
    req = {body: {vectorStoreId}};
  });
  it('should return 400 if no vectorStoreId provided', async () => {
    req.body.vectorStoreId = null;
    await deleteVectorStore(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'vectorStoreId is required'});
  });
  it('should call deleteVectorStoreDBInteraction with correct vectorStoreId', async () => {
    await deleteVectorStore(req, res);
    expect(deleteVectorStoreDBInteraction).toHaveBeenCalledWith({vectorStoreId});
  });
  it('should call deleteVectorStoreOpenaiHelper with correct vectorStoreId', async () => {
    await deleteVectorStore(req, res);
    expect(deleteVectorStoreOpenaiHelper).toHaveBeenCalledWith({vectorStoreId});
  });
  it('should call deleteFolder with correct vectorStoreId', async () => {
    await deleteVectorStore(req, res);
    expect(deleteFolder).toHaveBeenCalledWith({folderName: vectorStoreId});
  });
  it('should return 200 with success message', async () => {
    await deleteVectorStore(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({message: 'Assistant deleted successfully'});
  });
});
