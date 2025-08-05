const {deleteAssistant} = require('../../../../server/admin/controller/deleteAssistant');
const {deleteAssistant: deleteAssistantDBInteraction} = require('../../../../server/admin/dbInteractions');
const {deleteAssistant: deleteAssistantOpenaiHelper} = require('../../../../helpers/openAI');
const {MockResponse} = require('../../../setupTests');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  deleteAssistant: jest.fn(),
}));
jest.mock('../../../../helpers/openAI', () => ({
  deleteAssistant: jest.fn(),
}));

const assistantId = 'test-assistant-id';
describe('deleteAssistant', () => {
  let res; let req;

  beforeEach(() => {
    res = new MockResponse();
    req = {body: {assistantId}};
  });
  it('should return 400 if no assistantId provided', async () => {
    req.body.assistantId = null;
    await deleteAssistant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'assistantId is required'});
  });
  it('should call deleteAssistantDBInteraction with correct assistantId', async () => {
    await deleteAssistant(req, res);
    expect(deleteAssistantDBInteraction).toHaveBeenCalledWith({assistantId});
  });
  it('should call deleteAssistantOpenaiHelper with correct assistantId', async () => {
    await deleteAssistant(req, res);
    expect(deleteAssistantOpenaiHelper).toHaveBeenCalledWith({assistantId});
  });
  it('should return 200 with success message', async () => {
    await deleteAssistant(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({message: 'Assistant deleted successfully'});
  });
});
