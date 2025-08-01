const express = require('express');
const router = express.Router();
const {createAssistant} = require('./controller/createAssistant');


router.get('/health', (_req, res) => {
  res.json({status: 'OK'});
});

router.post('/assistant/create', createAssistant);

module.exports = router;