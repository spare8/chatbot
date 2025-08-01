const fs = require('fs');
const path = require('path');
const {
  listVectorStores,
  searchVectorStoreFiles,
  listAllFiles,
} = require('../../helpers/openAI');

jest.mock('fs');
jest.mock('path');
jest.mock('../../helpers/openAI');

const {validateVectorStores} = require('../../scripts/vectorStoreValidate');

describe('vectorStoreValidate.js', () => {
  const mockVSConfig = {
    myVS: {
      id: 'vs_1',
      files: {
        'a.json': {id: 'file_a'},
        'b.json': {id: 'file_b'},
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
  });

  it('should warn when VSConfig.json is missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await validateVectorStores();
    expect(errorSpy).toHaveBeenCalledWith('VSConfig.json not found');
    errorSpy.mockRestore();
  });

  it('should warn on invalid JSON in VSConfig', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('not-json');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await validateVectorStores();

    const calls = errorSpy.mock.calls.flat();
    const matched = calls.some((msg) => msg.includes('Failed to parse VSConfig.json'));
    expect(matched).toBe(true);

    errorSpy.mockRestore();
  });


  it('should detect vector store mismatches and orphan files', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockVSConfig));

    listVectorStores.mockResolvedValue({
      data: [
        {id: 'vs_1', name: 'myVS'},
        {id: 'vs_unknown', name: 'strayVS'}, // Not in config
      ],
    });

    searchVectorStoreFiles.mockImplementation(async (vsId) => {
       await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async delay 
      if (vsId === 'vs_1') {
        return {data: [{id: 'file_a'}]}; // file_b missing
      }
      if (vsId === 'vs_unknown') {
        return {data: [{id: 'file_unknown'}]};
      }
      return {data: []};
    });

    listAllFiles.mockResolvedValue([
      {id: 'file_a', filename: 'a.json'},
      {id: 'file_unknown', filename: 'ghost.json'},
      {id: 'orphan', filename: 'orphan.json'}, // not linked to any VS
    ]);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await validateVectorStores();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Vector store \'vs_unknown\''));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('File \'file_unknown\' exists in OpenAI vector store'));
    // expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Vector store \'myVS\''));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('File \'orphan\' (name: \'orphan.json\') exists'));

    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});
