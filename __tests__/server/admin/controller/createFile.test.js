const {MockResponse} = require('../../../setupTests');
const {createFile} = require('../../../../server/admin/controller/createFile');
const {createFile: createFileDBInteraction} = require('../../../../server/admin/dbInteractions');
const {uploadFileToOpenAI, addFileToVectorStore} = require('../../../../helpers/openAI');
const {createFile: createFileS3Helper} = require('../../../../helpers/s3Helpers');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  createFile: jest.fn(),
}));
jest.mock('../../../../helpers/openAI', () => ({
  uploadFileToOpenAI: jest.fn(),
  addFileToVectorStore: jest.fn(),
}));
jest.mock('../../../../helpers/s3Helpers', () => ({
  createFile: jest.fn(),
}));

const openaiId = 'test';
const vectorStoreId = 'testVectorStoreId';
const fileName = 'testFile.txt';
const fileContent = Buffer.from('This is a test file content');
let file;
describe('createFile', () => {
  let res; let req;

  beforeAll( ()=> {
    uploadFileToOpenAI.mockResolvedValue(openaiId);
  });
  beforeEach(() => {
    res = new MockResponse();
    file = {
      originalname: fileName,
      buffer: fileContent,
    };
    req = {file: file, body: {vectorStoreId}};
  });

  it('should throw error if no file', async () => {
    req.file = null;
    await createFile(req, res);
    expect(createFileS3Helper).not.toHaveBeenCalled();
    expect(createFileDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('should throw error if no fileName', async () => {
    req.file.originalname = '';
    await createFile(req, res);
    expect(createFileS3Helper).not.toHaveBeenCalled();
    expect(createFileDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('should throw error if file buffer', async () => {
    req.file.buffer = '';
    await createFile(req, res);
    expect(createFileS3Helper).not.toHaveBeenCalled();
    expect(createFileDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('should throw error if no vectorStoreId', async () => {
    req.body.vectorStoreId = '';
    await createFile(req, res);
    expect(createFileS3Helper).not.toHaveBeenCalled();
    expect(createFileDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create assistant', async () => {
    await createFile(req, res);
    expect(uploadFileToOpenAI).toHaveBeenCalledWith({buffer: fileContent, fileName});
    expect(addFileToVectorStore).toHaveBeenCalledWith({fileId: openaiId, vectorStoreId});
    expect(createFileDBInteraction).toHaveBeenCalledWith({fileName, openaiId, vectorStoreId});
    expect(createFileS3Helper).toHaveBeenCalledWith({
      folderName: vectorStoreId, fileName, fileContent});
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
