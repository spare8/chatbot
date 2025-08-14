const express = require('express');
const router = express.Router();
const multer = require('multer');

// Assistant controllers (leave as-is)
const {createAssistant} = require('./controller/assistants/createAssistant');
const {updateAssistant} = require('./controller/assistants/updateAssistant');
const {deleteAssistant} = require('./controller/assistants/deleteAssistant');
const {listAssistants} = require('./controller/assistants/listAssistants');
const {linkAssistantToVS} = require('./controller/assistants/linkAssistantToVS');
const {unlinkAssistantFromVS} = require('./controller/assistants/unlinkAssistantfromVS');

// Vector store controllers (leave as-is)
const {createVectorStore} = require('./controller/vectorStores/createVectorStore');
const {listVectorStores} = require('./controller/vectorStores/listVectorStores');
const {deleteVectorStore} = require('./controller/vectorStores/deleteVectorStore');
const {createFile} = require('./controller/vectorStores/createFile');
const {deleteFile} = require('./controller/vectorStores/deleteFile');
const {getFile} = require('./controller/vectorStores/getFile');

// THREADS (body-based)
const createThread = require('./controller/threads/createThread');
const getThreadFull = require('./controller/threads/getThread'); // unified: roomId or threadOpenAIId in body
const listUserThreads = require('./controller/threads/listUserThreads'); // body-based list
const deleteThread = require('./controller/threads/deleteThread'); // body-based delete

// MESSAGES (body-based)
const sendMessage = require('./controller/messages/sendMessage');
const deleteMessage = require('./controller/messages/deleteMessage');
const trimMessage = require('./controller/messages/trimMessage');

// configure multer to keep files in memory
const upload = multer({storage: multer.memoryStorage()});

// --- Health ---
router.get('/health', (_req, res) => {
  res.json({status: 'OK'});
});

// --- Assistant Management (unchanged) ---
router.post('/assistant/create', createAssistant);
router.post('/assistant/update', updateAssistant);
router.post('/assistant/delete', deleteAssistant);
router.get('/assistant/list', listAssistants);
router.post('/assistant/link-vs', linkAssistantToVS);
router.post('/assistant/unlink-vs', unlinkAssistantFromVS);

// --- Vector Store Management (unchanged) ---
router.post('/vectorStore/create', createVectorStore);
router.get('/vectorStore/list', listVectorStores);
router.post('/vectorStore/delete', deleteVectorStore);

// --- File Management (unchanged) ---
router.post('/vectorStore/createFile', upload.single('file'), createFile);
router.post('/vectorStore/deleteFile', deleteFile);
router.post('/vectorStore/getFile', getFile);

// --- Threads (body-based) ---
router.post('/thread', createThread); // Body: { assistantOpenAIId, userId? }
router.post('/thread/full', getThreadFull); // Body: { roomId? | threadOpenAIId?, limit?, beforeId? }
router.post('/threads/list', listUserThreads); // Body: { userId, limit?, cursor? }
router.post('/thread/delete', deleteThread); // Body: { roomId }

// --- Messages (body-based) ---
router.post('/message/send', sendMessage); // Body: { roomId, content, userId?, options? }
router.post('/message/delete', deleteMessage); // Body: { roomId, messageId }
router.post('/message/trim', trimMessage); // Body: { roomId, messageId }

// const adminConfigRoutes = require('./controller/envConfigRoutes'); // see below
// app.use('/config', restrictToFrontend, adminConfigRoutes);

module.exports = router;
