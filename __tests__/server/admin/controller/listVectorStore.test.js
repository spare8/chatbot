const {listVectorStores} = require('../../../../server/admin/controller/listVectorStores');
const {getAllVectorStores} = require('../../../../server/admin/dbInteractions');
const {MockResponse} = require('../../../setupTests');

jest.mock('../../../../server/admin/dbInteractions', () => ({
  getAllVectorStores: jest.fn(),
}));

const mockVectorStores = [
  {id: '1', name: 'VS 1'},
  {id: '2', name: 'VS 2'},
];
describe('listVectorStores', () => {
  let res; let req;

  beforeAll( ()=> {
    getAllVectorStores.mockResolvedValue(mockVectorStores);
  });
  beforeEach(() => {
    res = new MockResponse();
    req = {};
  });

  it('should return a list of assistants', async () => {
    await listVectorStores(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockVectorStores);
  });
});
