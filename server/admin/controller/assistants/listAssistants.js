const {getAllAssistants} = require('../../dbInteractions');

async function listAssistants(req, res) {
  const assistants = await getAllAssistants();
  res.status(200).json(assistants);
}

module.exports = {
  listAssistants,
};
