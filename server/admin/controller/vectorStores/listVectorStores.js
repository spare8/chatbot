const {getAllVectorStores} = require('../../dbInteractions');

async function listVectorStores(req, res) {
  const vectorStores = await getAllVectorStores();
  res.status(200).json(vectorStores);
}

module.exports = {
  listVectorStores,
};
