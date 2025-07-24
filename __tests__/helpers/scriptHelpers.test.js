const fs = require('fs');
const crypto = require('crypto');
const {isVSInConfig, createEmptyVS, fileHash} = require('../../helpers/scriptHelpers');
const {createVectorStore} = require('../../helpers/openAI');

jest.mock('fs');
jest.mock('../../helpers/openAI');

describe('Vector Store Helpers', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isVSInConfig', () => {
    it('should return true if VSName exists in config', () => {
      const mockConfig = {myVS: {id: 'vs-id'}};
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = isVSInConfig({VSName: 'myVS'});
      expect(result).toBe(true);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf-8');
    });

    it('should return false if config file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = isVSInConfig({VSName: 'nonExistentVS'});
      expect(result).toBe(false);
    });

    it('should return false if VSName is not in config', () => {
      const mockConfig = {anotherVS: {id: 'vs-id'}};
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = isVSInConfig({VSName: 'myVS'});
      expect(result).toBe(false);
    });
  });

  describe('createEmptyVS', () => {
    it('should create a new vector store and write to config', async () => {
      const mockVSName = 'newVS';
      const mockVSId = 'mock-vs-id';
      const initialConfig = {};

      createVectorStore.mockResolvedValueOnce(mockVSId);
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(initialConfig));
      fs.writeFileSync.mockImplementation(() => {});

      await createEmptyVS({VSName: mockVSName});

      expect(createVectorStore).toHaveBeenCalledWith({VSName: mockVSName});
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify({[mockVSName]: {id: mockVSId, files: {}}}, null, 2),
        'utf-8'
      );
    });

    it('should throw error if config cannot be parsed', async () => {
      createVectorStore.mockResolvedValueOnce('mock-vs-id');
      fs.readFileSync.mockReturnValueOnce(null); // invalid config

      await expect(createEmptyVS({VSName: 'badVS'})).rejects.toThrow('Failed to create vector store');
    });

    it('should throw error if createVectorStore fails', async () => {
      createVectorStore.mockRejectedValueOnce(new Error('OpenAI failure'));

      await expect(createEmptyVS({VSName: 'badVS'})).rejects.toThrow(
        'Failed to create vector store: OpenAI failure'
      );
    });
  });

  describe('fileHash', () => {
    it('should return sha256 hash of file content', () => {
      const fileContent = 'Hello world!';
      const mockHash = crypto.createHash('sha256').update(fileContent).digest('hex');
      fs.readFileSync.mockReturnValueOnce(fileContent);

      const result = fileHash({fileName: 'file.txt', VSName: 'myVS'});

      expect(result).toBe(mockHash);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('myVS/file.txt'),
        'utf-8'
      );
    });
  });
});
