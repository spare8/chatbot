const {MockResponse} = require('../../../../setupTests');
const {createAssistant} = require('../../../../../server/admin/controller/assistant/createAssistant');
const {createAssistant: createAssistantDBInteraction} = require('../../../../../server/admin/dbInteractions');
const {createAssistant2: createAssistantOpenaiHelper} = require('../../../../../helpers/openAI');

jest.mock('../../../../../server/admin/dbInteractions', () => ({
  createAssistant: jest.fn(),
}));
jest.mock('../../../../../helpers/openAI', () => ({
  createAssistant2: jest.fn(),
}));

const openaiId = 'test';
const name = 'test name';
const description = 'test desc';
const model = 'test model';
const instructions = 'test ins';
describe('createAssistant', () => {
  let res; let req;

  beforeAll( ()=> {
    createAssistantOpenaiHelper.mockResolvedValue(openaiId);
    createAssistantDBInteraction.mockResolvedValue({name, description, instructions, model, openaiId});
  });
  beforeEach(() => {
    res = new MockResponse();
    req = {body: {name, description, instructions, model}};
  });

  it('should throw error if no name', async () => {
    req.body.name = '';
    await createAssistant(req, res);
    expect(createAssistantOpenaiHelper).not.toHaveBeenCalled();
    expect(createAssistantDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('should throw error if no instructions', async () => {
    req.body.instructions = '';
    await createAssistant(req, res);
    expect(createAssistantOpenaiHelper).not.toHaveBeenCalled();
    expect(createAssistantDBInteraction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create assistant', async () => {
    await createAssistant(req, res);
    expect(createAssistantOpenaiHelper).toHaveBeenCalledWith({
      name, description, instructions, model, toolResources: {}, tools: []});
    expect(createAssistantDBInteraction).toHaveBeenCalledWith({
      name, description, instructions, model, openaiId, toolResources: {}, tools: [],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({name, description, instructions,
      model, openaiId}));
  });
});
