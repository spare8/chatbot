const {getConfigStatus} = require('../../../../helpers/configStatus');

function configStatus(req, res) {
  res.json(getConfigStatus());
}

module.exports = {configStatus};
