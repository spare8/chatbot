const express = require('express');
const router = express.Router();
const multer = require('multer');
// const {restrictToFrontend} = require('../../helpers/globalMiddlewares');
const {createAssistant} = require('./controller/assistants/createAssistant');
const {updateAssistant} = require('./controller/assistants/updateAssistant');
const {deleteAssistant} = require('./controller/assistants/deleteAssistant');
const {listAssistants} = require('./controller/assistants/listAssistants');
const {linkAssistantToVS} = require('./controller/assistants/linkAssistantToVS');
const {unlinkAssistantFromVS} = require('./controller/assistants/unlinkAssistantfromVS');
const {createVectorStore} = require('./controller/vectorStores/createVectorStore');
const {listVectorStores} = require('./controller/vectorStores/listVectorStores');
const {deleteVectorStore} = require('./controller/vectorStores/deleteVectorStore');
const {createFile} = require('./controller/vectorStores/createFile');
const {deleteFile} = require('./controller/vectorStores/deleteFile');
const {getFile} = require('./controller/vectorStores/getFile');

// configure multer to keep files in memory
const upload = multer({storage: multer.memoryStorage()});

router.get('/health', (_req, res) => {
  res.json({status: 'OK'});
});

// Assistant Management
router.post('/assistant/create', createAssistant);
router.post('/assistant/update', updateAssistant);
router.post('/assistant/delete', deleteAssistant);
router.get('/assistant/list', listAssistants);
router.post('/assistant/link-vs', linkAssistantToVS);
router.post('/assistant/unlink-vs', unlinkAssistantFromVS);

// Vector Store Management
router.post('/vectorStore/create', createVectorStore);
router.get('/vectorStore/list', listVectorStores);
router.post('/vectorStore/delete', deleteVectorStore);

// File Management
router.post('/vectorStore/createFile', upload.single('file'), createFile);
router.post('/vectorStore/deleteFile', deleteFile);
router.post('/vectorStore/getFile', getFile);


// const adminConfigRoutes = require('./controller/envConfigRoutes'); // see below
// app.use('/config', restrictToFrontend, adminConfigRoutes);

module.exports = router;
