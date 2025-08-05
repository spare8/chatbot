const {listAssistants} = require('../../../../server/admin/controller/listAssistants');
const {getAllAssistants} = require('../../../../server/admin/dbInteractions');
const {MockResponse} = require('../../../setupTests');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  getAllAssistants: jest.fn(),
}));

const mockAssistants = [
  {id: '1', name: 'Assistant 1'},
  {id: '2', name: 'Assistant 2'},
];
describe('listAssistants', () => {
  let res; let req;

  beforeAll( ()=> {
    getAllAssistants.mockResolvedValue(mockAssistants);
  });
  beforeEach(() => {
    res = new MockResponse();
    req = {};
  });

  it('should return a list of assistants', async () => {
    await listAssistants(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAssistants);
  });
});
