const express = require('express');
const router = express.Router();
const multer = require('multer');
const {createAssistant} = require('./controller/createAssistant');
const {updateAssistant} = require('./controller/modifyAssistant');
const {deleteAssistant} = require('./controller/deleteAssistant');
const {listAssistants} = require('./controller/listAssistants');
const {createVectorStore} = require('./controller/createVectorStore');
const {listVectorStores} = require('./controller/listVectorStores');
const {deleteVectorStore} = require('./controller/deleteVectorStore');
const {createFile} = require('./controller/createFile');

// configure multer to keep files in memory
const upload = multer({ storage: multer.memoryStorage() });

router.get('/health', (_req, res) => {
  res.json({status: 'OK'});
});

// Assistant Management
router.post('/assistant/create', createAssistant);
router.post('/assistant/update', updateAssistant);
router.post('/assistant/delete', deleteAssistant);
router.get('/assistant/list', listAssistants);

// Vector Store Management
router.post('/vectorStore/create', createVectorStore);
router.get('/vectorStore/list', listVectorStores);
router.post('/vectorStore/delete', deleteVectorStore);

// File Management
router.post('/vectorStore/createFile', upload.single('file'), createFile);

module.exports = router;
