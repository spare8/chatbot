const fs = require('fs');
const crypto = require('crypto');
const {isVSInConfig, createEmptyVS, fileHash, addFile, deleteFile, getVectorStoreFolderNames,
  deleteMissingVectorStoresFromConfig} = require('../../helpers/scriptHelpers');
const {createVectorStore, addFileToVectorStore, uploadFileToOpenAI,
  deleteFileById, deleteFileFromVectorStore, deleteVectorStore} = require('../../helpers/openAI');


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
          'utf-8',
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
          'Failed to create vector store: OpenAI failure',
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
          expect.any(String),
          'utf-8',
      );
    });
  });

  describe('isFileHashMatch', () => {
    const {isFileHashMatch} = require('../../helpers/scriptHelpers');

    it('should return true if hashes match', () => {
      const config = {
        myVS: {
          files: {
            'file.txt': {hash: 'abc123'},
          },
        },
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = isFileHashMatch({fileName: 'file.txt', VSName: 'myVS', currentHash: 'abc123'});
      expect(result).toBe(true);
    });

    it('should return false if hashes do not match', () => {
      const config = {
        myVS: {
          files: {
            'file.txt': {hash: 'wronghash'},
          },
        },
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = isFileHashMatch({fileName: 'file.txt', VSName: 'myVS', currentHash: 'abc123'});
      expect(result).toBe(false);
    });

    it('should return false if config file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = isFileHashMatch({fileName: 'file.txt', VSName: 'myVS', currentHash: 'abc123'});
      expect(result).toBe(false);
    });
  });

  describe('isFileInVSConfig', () => {
    const {isFileInVSConfig} = require('../../helpers/scriptHelpers');

    it('should return true if file exists on disk', () => {
      fs.existsSync.mockReturnValue(true);
      const result = isFileInVSConfig({fileName: 'doc.md', VSName: 'myVS'});
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return false if file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = isFileInVSConfig({fileName: 'doc.md', VSName: 'myVS'});
      expect(result).toBe(false);
    });
  });

  describe('addFile', () => {
    const VSName = 'myVS';
    const fileName = 'test.json';

    beforeEach(() => {
      jest.clearAllMocks();
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
    });

    it('should upload and add a new file to the vector store', async () => {
      const config = {
        [VSName]: {id: 'vs-abc123', files: {}},
      };
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('VSConfig.json')) {
          return JSON.stringify(config);
        }
        return 'file content';
      });

      uploadFileToOpenAI.mockResolvedValue({id: 'file-xyz789'});
      addFileToVectorStore.mockResolvedValue({id: 'file-xyz789'});

      await addFile({fileName, VSName});

      expect(uploadFileToOpenAI).toHaveBeenCalledWith(expect.any(String));
      expect(addFileToVectorStore).toHaveBeenCalledWith({
        fileId: 'file-xyz789',
        vectorStoreId: 'vs-abc123',
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('file-xyz789'),
          'utf-8',
      );
    });

    it('should skip upload if file hash matches', async () => {
      const content = 'file content';
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      const config = {
        [VSName]: {
          id: 'vs-abc123',
          files: {
            [fileName]: {id: 'file-abc', hash},
          },
        },
      };
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('VSConfig.json')) {
          return JSON.stringify(config);
        }
        return content;
      });

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await addFile({fileName, VSName});

      expect(uploadFileToOpenAI).not.toHaveBeenCalled();
      expect(addFileToVectorStore).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'));
      logSpy.mockRestore();
    });

    it('should throw if vector store is missing in config', async () => {
      fs.readFileSync.mockReturnValue(JSON.stringify({}));

      await expect(addFile({fileName, VSName})).rejects.toThrow(
          `Vector store '${VSName}' not found in config`,
      );
    });

    it('should throw if uploadFileToOpenAI fails', async () => {
      const config = {
        [VSName]: {id: 'vs-abc123', files: {}},
      };
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('VSConfig.json')) {
          return JSON.stringify(config);
        }
        return 'file content';
      });

      uploadFileToOpenAI.mockResolvedValue(null);

      await expect(addFile({fileName, VSName})).rejects.toThrow(
          `Failed to upload '${fileName}' to OpenAI`,
      );
    });

    it('should throw if addFileToVectorStore fails', async () => {
      const config = {
        [VSName]: {id: 'vs-abc123', files: {}},
      };
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('VSConfig.json')) {
          return JSON.stringify(config);
        }
        return 'file content';
      });

      uploadFileToOpenAI.mockResolvedValue({id: 'file-xyz789'});
      addFileToVectorStore.mockResolvedValue(null);

      await expect(addFile({fileName, VSName})).rejects.toThrow(
          `Failed to add '${fileName}' to vector store '${VSName}'`,
      );
    });

    it('should initialize files object if missing in config', async () => {
      const config = {
        [VSName]: {id: 'vs-abc123'}, // no `files` key
      };
      fs.readFileSync.mockImplementation((path) => {
        if (path.includes('VSConfig.json')) {
          return JSON.stringify(config);
        }
        return 'file content';
      });

      uploadFileToOpenAI.mockResolvedValue({id: 'file-xyz789'});
      addFileToVectorStore.mockResolvedValue({id: 'file-xyz789'});

      await addFile({fileName, VSName});

      expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('"files"'),
          'utf-8',
      );
    });
  });


  describe('deleteFile', () => {
    const VSName = 'myVS';
    const fileName = 'test.json';
    const fileId = 'file-abc123';
    const vectorStoreId = 'vs-abc123';

    beforeEach(() => {
      jest.clearAllMocks();
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
    });

    it('should delete the file from vector store and OpenAI and update config', async () => {
      const config = {
        [VSName]: {
          id: vectorStoreId,
          files: {
            [fileName]: {id: fileId, hash: 'xyz'},
          },
        },
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      deleteFileFromVectorStore.mockResolvedValue({});
      deleteFileById.mockResolvedValue({});

      await deleteFile({fileName, VSName});

      expect(deleteFileFromVectorStore).toHaveBeenCalledWith({fileId, vectorStoreId});
      expect(deleteFileById).toHaveBeenCalledWith(fileId);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          expect.not.stringContaining(fileName),
          'utf-8',
      );
    });

    it('should throw if config does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      await expect(deleteFile({fileName, VSName})).rejects.toThrow('VSConfig.json does not exist');
    });

    it('should throw if vector store not found in config', async () => {
      const config = {};
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      await expect(deleteFile({fileName, VSName})).rejects.toThrow(
          `Vector store '${VSName}' not found in config.`,
      );
    });

    it('should throw if file is not found in vector store config', async () => {
      const config = {
        [VSName]: {
          id: vectorStoreId,
          files: {},
        },
      };
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      await expect(deleteFile({fileName, VSName})).rejects.toThrow(
          `File '${fileName}' not found in vector store '${VSName}'`,
      );
    });

    it('should log error if OpenAI deletion fails', async () => {
      const config = {
        [VSName]: {
          id: vectorStoreId,
          files: {
            [fileName]: {id: fileId, hash: 'xyz'},
          },
        },
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      deleteFileFromVectorStore.mockRejectedValue(new Error('vector store deletion failed'));

      await expect(deleteFile({fileName, VSName})).rejects.toThrow('vector store deletion failed');
    });
  });
  describe('getVectorStoreFolderNames', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return list of folder names in knowledgebank', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['VS1', 'VS2']);
      fs.lstatSync.mockReturnValue({isDirectory: () => true});

      const result = getVectorStoreFolderNames();
      expect(result).toEqual(['VS1', 'VS2']);
    });

    it('should filter out non-directories', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['VS1', 'file.txt']);
      fs.lstatSync.mockImplementation((p) => ({
        isDirectory: () => !p.endsWith('file.txt'),
      }));

      const result = getVectorStoreFolderNames();
      expect(result).toEqual(['VS1']);
    });

    it('should return empty array if knowledgebank folder does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = getVectorStoreFolderNames();
      expect(result).toEqual([]);
    });
  });

  describe('deleteMissingVectorStoresFromConfig', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete orphaned vector store from OpenAI and update config', async () => {
      const config = {
        OrphanVS: {id: 'vs-orphan-id'},
        ValidVS: {id: 'vs-valid-id'},
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.readdirSync.mockReturnValue(['ValidVS']);
      fs.lstatSync.mockReturnValue({isDirectory: () => true});

      deleteVectorStore.mockResolvedValue({});
      const writeSpy = jest.spyOn(fs, 'writeFileSync');

      await deleteMissingVectorStoresFromConfig();

      expect(deleteVectorStore).toHaveBeenCalledWith('vs-orphan-id');

      const updatedConfig = JSON.parse(writeSpy.mock.calls[0][1]);
      expect(updatedConfig).not.toHaveProperty('OrphanVS');
      expect(updatedConfig).toHaveProperty('ValidVS');
    });

    it('should skip vector store if ID is missing', async () => {
      const config = {
        BadVS: {}, // missing `id`
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.readdirSync.mockReturnValue([]); // no folders
      fs.lstatSync.mockReturnValue({isDirectory: () => true});

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await deleteMissingVectorStoresFromConfig();

      expect(deleteVectorStore).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should not write config if no deletions were needed', async () => {
      const config = {
        CleanVS: {id: 'vs-clean'},
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.readdirSync.mockReturnValue(['CleanVS']);
      fs.lstatSync.mockReturnValue({isDirectory: () => true});

      const writeSpy = jest.spyOn(fs, 'writeFileSync');
      await deleteMissingVectorStoresFromConfig();

      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should log and rethrow if deleteVectorStore fails', async () => {
      const config = {
        OrphanVS: {id: 'vs-orphan-id'},
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.readdirSync.mockReturnValue([]);
      fs.lstatSync.mockReturnValue({isDirectory: () => true});

      deleteVectorStore.mockRejectedValue(new Error('API error'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await deleteMissingVectorStoresFromConfig();

      expect(deleteVectorStore).toHaveBeenCalledWith('vs-orphan-id');
      errorSpy.mockRestore();
    });
  });
});
