// __tests__/controller/createFile.test.js
const { MockResponse } = require('../../../setupTests');
jest.mock('sanitize-filename');
const sanitize = require('sanitize-filename');

// Mocks for dependencies
jest.mock('../../../../helpers/openAI', () => ({
  uploadFileToOpenAI: jest.fn(),
  addFileToVectorStore: jest.fn(),
}));
jest.mock('../../../../helpers/s3Helpers', () => ({ createFile: jest.fn() }));
jest.mock('../../../../server/admin/dbInteractions', () => ({ createFile: jest.fn() }));

const { uploadFileToOpenAI, addFileToVectorStore } = require('../../../../helpers/openAI');
const {createFile: createFileS3Helper} = require('../../../../helpers/s3Helpers');
const {createFile: createFileDB} = require('../../../../server/admin/dbInteractions');
const { createFile } = require('../../../../server/admin/controller/createFile');

// Fix Date.now for predictable fallback
const FIXED_TIMESTAMP = 1620000000000;
beforeAll(() => { jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP); });
afterAll(() => { Date.now.mockRestore(); });

describe('createFile controller', () => {
  let req, res;
  const vectorStoreId = 'vs123';
  const openaiId = 'openai-file-id';
  const rawName = 'te<>st?.txt';
  const sanitizedName = 'test.txt';
  const buffer = Buffer.from('content');

  beforeAll(() => {
    uploadFileToOpenAI.mockResolvedValue(openaiId);
  });
  beforeEach(() => {
    res = new MockResponse();
    req = {
      file: { originalname: rawName, buffer },
      body: { vectorStoreId },
    };
  });

  it('returns 400 if missing file or params', async () => {
    const badReqs = [
      { file: null, body: { vectorStoreId }},
      { file: { originalname: null, buffer }, body: { vectorStoreId } },
      { file: { originalname: rawName, buffer: null }, body: { vectorStoreId } },
      { file: { originalname: rawName, buffer } , body: { vectorStoreId: '' } },
    ];
    for (const bad of badReqs) {
      await createFile(bad, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
      // No upstream calls
      expect(uploadFileToOpenAI).not.toHaveBeenCalled();
      expect(addFileToVectorStore).not.toHaveBeenCalled();
      expect(createFileDB).not.toHaveBeenCalled();
      expect(createFileS3Helper).not.toHaveBeenCalled();
    }
  });

  it('uses sanitized filename when sanitize returns non-empty', async () => {
    sanitize.mockReturnValue(sanitizedName);

    await createFile(req, res);
    expect(uploadFileToOpenAI).toHaveBeenCalledWith({ buffer, fileName: sanitizedName });
    expect(addFileToVectorStore).toHaveBeenCalledWith({ fileId: openaiId, vectorStoreId });
    expect(createFileDB).toHaveBeenCalledWith({ fileName: sanitizedName, openaiId, vectorStoreId });
    expect(createFileS3Helper).toHaveBeenCalledWith({ folderName: vectorStoreId, fileName: sanitizedName, fileContent: buffer });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'File uploaded successfully' });
  });

  it('falls back to timestamp when sanitize returns empty', async () => {
    sanitize.mockReturnValue('');
    const fallbackName = `${FIXED_TIMESTAMP}`;

    await createFile(req, res);
    expect(uploadFileToOpenAI).toHaveBeenCalledWith({ buffer, fileName: fallbackName });
    expect(addFileToVectorStore).toHaveBeenCalledWith({ fileId: openaiId, vectorStoreId });
    expect(createFileDB).toHaveBeenCalledWith({ fileName: fallbackName, openaiId, vectorStoreId });
    expect(createFileS3Helper).toHaveBeenCalledWith({ folderName: vectorStoreId, fileName: fallbackName, fileContent: buffer });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'File uploaded successfully' });
  });
});
