// tests/server/admin/controller/updateAssistant.test.js

const {MockResponse} = require('../../../setupTests');
const {updateAssistant} = require('../../../../server/admin/controller/modifyAssistant');
const {updateAssistant: updateAssistantDBInteraction} = require('../../../../server/admin/dbInteractions');
const {modifyAssistant2: modifyAssistantOpenaiHelper} = require('../../../../helpers/openAI');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  updateAssistant: jest.fn(),
}));
jest.mock('../../../../helpers/openAI', () => ({
  modifyAssistant2: jest.fn(),
}));

describe('updateAssistant', () => {
  let req; let res;

  const validBody = {
    assistantId: 'oa123',
    name: 'My Bot',
    instructions: 'Say hello',
    model: 'gpt-3.5-turbo',
    description: 'A friendly assistant',
    tools: [],
    toolResources: {},
    vectorStoreIds: [],
    metadata: {},
  };

  beforeAll(() => {
    // stub OpenAI helper to return something truthy
    modifyAssistantOpenaiHelper.mockResolvedValue({assistantId: validBody.assistantId});
    // stub DB interaction to return the updated doc
    updateAssistantDBInteraction.mockResolvedValue({
      openaiId: validBody.assistantId,
      ...validBody,
      updatedAt: new Date().toISOString(),
    });
  });

  beforeEach(() => {
    res = new MockResponse();
    req = {body: {...validBody}};
  });

  it('returns 400 if assistantId is missing', async () => {
    delete req.body.assistantId;
    await updateAssistant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({error: expect.any(String)}),
    );
  });

  it('returns 400 if name/instructions/model missing', async () => {
    req.body.assistantId = 'oa123';
    req.body.name = '';
    await updateAssistant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({error: expect.any(String)}),
    );
  });

  it('calls OpenAI helper and DB update, then returns 200 + updated assistant', async () => {
    await updateAssistant(req, res);

    // 1) OpenAI helper gets the full payload
    expect(modifyAssistantOpenaiHelper).toHaveBeenCalledWith({
      assistantId: validBody.assistantId,
      name: validBody.name,
      instructions: validBody.instructions,
      description: validBody.description,
      model: validBody.model,
      tools: validBody.tools,
      toolResources: validBody.toolResources,
      metadata: validBody.metadata,
    });

    // 2) DB interaction gets the same fields
    expect(updateAssistantDBInteraction).toHaveBeenCalledWith({
      assistantId: validBody.assistantId,
      name: validBody.name,
      instructions: validBody.instructions,
      description: validBody.description,
      model: validBody.model,
      tools: validBody.tools,
      toolResources: validBody.toolResources,
      vectorStores: validBody.vectorStoreIds,
      metadata: validBody.metadata,
    });

    // 3) Response is 200 with the updated object
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({openaiId: validBody.assistantId, name: validBody.name}),
    );
  });

  it('throws if OpenAI helper returns null', async () => {
    modifyAssistantOpenaiHelper.mockResolvedValueOnce(null);
    await expect(updateAssistant(req, res)).rejects.toThrow(
        'OpenAI modifyAssistant2 did not return data',
    );
  });
  it('injects file_search tool and resource when vectorStoreIds is non-empty', async () => {
  // Arrange
    const vsIds = ['vs1', 'vs2'];
    req.body.tools = []; // no tools initially
    req.body.toolResources = {}; // empty resources
    req.body.vectorStoreIds = vsIds; // trigger the branch

    // Stub OpenAI helper to return something truthy
    modifyAssistantOpenaiHelper.mockResolvedValue({assistantId: req.body.assistantId});
    // Stub DB update to echo back everything
    updateAssistantDBInteraction.mockResolvedValue({
      openaiId: req.body.assistantId,
      ...req.body,
      tools: [{type: 'file_search'}], // what we expect
      toolResources: {file_search: {vector_store_ids: vsIds}},
      vectorStores: vsIds,
      updatedAt: new Date().toISOString(),
    });

    // Act
    await updateAssistant(req, res);

    // Assert: OpenAI helper saw the injected tool & resources
    expect(modifyAssistantOpenaiHelper).toHaveBeenCalledWith(
        expect.objectContaining({
          assistantId: req.body.assistantId,
          tools: [{type: 'file_search'}],
          toolResources: {file_search: {vector_store_ids: vsIds}},
        }),
    );

    // Assert: DB interaction saw the same transformation
    expect(updateAssistantDBInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          assistantId: req.body.assistantId,
          tools: [{type: 'file_search'}],
          toolResources: {file_search: {vector_store_ids: vsIds}},
          vectorStores: vsIds,
        }),
    );

    // And we still return 200
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
