const {MockResponse} = require('../../../setupTests');
const {createVectorStore} = require('../../../../server/admin/controller/createVectorStore');
const {createVectorStore: createVectorStoreDbInteraction} = require('../../../../server/admin/dbInteractions');
const {createVectorStore: createVectorStoreOpenaiHelper} = require('../../../../helpers/openAI');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  createVectorStore: jest.fn(),
}));
jest.mock('../../../../helpers/openAI', () => ({
  createVectorStore: jest.fn(),
}));

const openaiId = 'test';
const name = 'test name';
const description = 'test desc';
const maxChunkSize = 10;
const maxChunkOverlap = 50;
describe('createVectorStore', () => {
  let res; let req;

  beforeAll( ()=> {
    createVectorStoreOpenaiHelper.mockResolvedValue(openaiId);
    createVectorStoreDbInteraction.mockResolvedValue({name, description, maxChunkOverlap, maxChunkSize, openaiId});
  });
  beforeEach(() => {
    res = new MockResponse();
    req = {body: {name, description, maxChunkOverlap, maxChunkSize}};
  });

  it('should throw error if no name', async () => {
    req.body.name = '';
    await createVectorStore(req, res);
    expect(createVectorStoreOpenaiHelper).not.toHaveBeenCalled();
    expect(createVectorStoreDbInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('should throw error if no description', async () => {
    req.body.description = '';
    await createVectorStore(req, res);
    expect(createVectorStoreOpenaiHelper).not.toHaveBeenCalled();
    expect(createVectorStoreDbInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create a vector store', async () => {
    await createVectorStore(req, res);
    expect(createVectorStoreOpenaiHelper).toHaveBeenCalledWith({
        name, description, maxChunkOverlap, maxChunkSize});
    expect(createVectorStoreDbInteraction).toHaveBeenCalledWith({
      name, description, maxChunkOverlap, maxChunkSize, openaiId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        "message": "Vector store created successfully", openaiId
    }));
  });
});
