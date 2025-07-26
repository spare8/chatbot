const fs = require('fs');
const path = require('path');
const helpers = require('../../helpers/scriptHelpers');

jest.mock('fs');
jest.mock('path');
jest.mock('../../helpers/scriptHelpers');

const vectorStoreSync = require('../../scripts/vectorstoreSync');
const {getFilesInFolder, syncFolder, syncAllFolders} = vectorStoreSync;

describe('vectorstoreSync.js', () => {
  const VSName = 'myVS';
  const localFiles = ['a.json', 'b.json'];

  beforeEach(() => {
    jest.clearAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
  });

  describe('getFilesInFolder', () => {
    it('should return an empty array if folder does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const result = getFilesInFolder(VSName);
      expect(result).toEqual([]);
    });

    it('should return only files from the folder', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['a.json', 'subfolder']);
      fs.lstatSync.mockImplementation((p) => ({
        isFile: () => p.endsWith('.json'),
      }));

      const result = getFilesInFolder(VSName);
      expect(result).toEqual(['a.json']);
    });
  });

  describe('syncFolder', () => {
    it('should create VS if not in config', async () => {
      helpers.isVSInConfig.mockReturnValue(false);
      helpers.createEmptyVS.mockResolvedValue();
      helpers.fileHash.mockReturnValue('hash');
      fs.readFileSync.mockReturnValue(JSON.stringify({[VSName]: {files: {}}}));

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(localFiles);
      fs.lstatSync.mockReturnValue({isFile: () => true});

      await syncFolder(VSName);

      expect(helpers.createEmptyVS).toHaveBeenCalledWith({VSName});
      expect(helpers.addFile).toHaveBeenCalledTimes(2);
    });

    it('should delete remote file missing locally and replace modified', async () => {
      helpers.isVSInConfig.mockReturnValue(true);
      helpers.fileHash.mockReturnValue('hash2');
      helpers.isFileHashMatch.mockReturnValue(false);
      fs.readFileSync.mockReturnValue(
          JSON.stringify({
            [VSName]: {
              id: 'vs-id',
              files: {
                'a.json': {id: 'id-a', hash: 'oldhash'},
                'ghost.json': {id: 'id-g', hash: 'ghosthash'},
              },
            },
          }),
      );

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['a.json', 'b.json']);
      fs.lstatSync.mockReturnValue({isFile: () => true});

      await syncFolder(VSName);

      expect(helpers.deleteFile).toHaveBeenCalledWith({fileName: 'ghost.json', VSName});
      expect(helpers.addFile).toHaveBeenCalledWith({fileName: 'a.json', VSName});
      expect(helpers.addFile).toHaveBeenCalledWith({fileName: 'b.json', VSName});
    });

    it('should skip unchanged file', async () => {
      helpers.isVSInConfig.mockReturnValue(true);
      helpers.fileHash.mockReturnValue('hash123');
      helpers.isFileHashMatch.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(
          JSON.stringify({
            [VSName]: {
              id: 'vs-id',
              files: {'a.json': {hash: 'hash123'}},
            },
          }),
      );
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['a.json']);
      fs.lstatSync.mockReturnValue({isFile: () => true});

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await syncFolder(VSName);

      expect(helpers.addFile).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('is up to date.'));
      logSpy.mockRestore();
    });
  });

  describe('syncAllFolders', () => {
    it('should sync all folders and clean up missing ones', async () => {
      const folders = ['vs1', 'vs2'];
      helpers.getVectorStoreFolderNames.mockReturnValue(folders);
      helpers.isVSInConfig.mockReturnValue(true);
      helpers.fileHash.mockReturnValue('h');
      helpers.isFileHashMatch.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        vs1: {id: 'v1', files: {'file.json': {hash: 'h'}}},
        vs2: {id: 'v2', files: {}},
      }));
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['file.json']);
      fs.lstatSync.mockReturnValue({isFile: () => true});

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await syncAllFolders();

      expect(helpers.getVectorStoreFolderNames).toHaveBeenCalled();
      expect(helpers.deleteMissingVectorStoresFromConfig).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/Full sync complete/));

      logSpy.mockRestore();
      errSpy.mockRestore();
    });

    // it('should log and continue if syncing a folder throws', async () => {
    //   helpers.getVectorStoreFolderNames.mockReturnValue(['badVS']);

    //   // Replace internal syncFolder reference manually
    //   const originalSyncFolder = vectorStoreSync.syncFolder;
    //   vectorStoreSync.syncFolder = jest.fn().mockRejectedValue(new Error('sync failed'));

    //   const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    //   await vectorStoreSync.syncAllFolders();

    //   expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to sync \'badVS\''));
    //   errSpy.mockRestore();
    //   vectorStoreSync.syncFolder = originalSyncFolder;
    // });

    it('should throw error if getVectorStoreFolderNames returns non-array', async () => {
      helpers.getVectorStoreFolderNames.mockReturnValue(undefined);
      await expect(syncAllFolders()).rejects.toThrow('getVectorStoreFolderNames did not return an array');
    });
  });
});
