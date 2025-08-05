const express = require('express');
const router = express.Router();
const {createAssistant} = require('./controller/createAssistant');
const {updateAssistant} = require('./controller/modifyAssistant');
const {deleteAssistant} = require('./controller/deleteAssistant');
const {listAssistants} = require('./controller/listAssistants');

router.get('/health', (_req, res) => {
  res.json({status: 'OK'});
});

router.post('/assistant/create', createAssistant);
router.post('/assistant/update/:assistantId', updateAssistant);
router.post('/assistant/delete/:assistantId', deleteAssistant);
router.get('/assistant/list', listAssistants);

module.exports = router;
