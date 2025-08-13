const {Router} = require('express');
const router = Router();
const {getConfig} = require('./controller/config/getConfig');
const {configStatus} = require('./controller/config/configStatus');
const {updateConfig} = require('./controller/config/updateConfig');
const {adminAuth, bootstrapGuard} = require('../../helpers/middlewares');
const {testOpenAI} = require('./controller/config/testOpenAI');
const {testMongoDB} = require('./controller/config/testMongoDB');
const {rateLimit} = require('express-rate-limit');

const limiter = rateLimit({windowMs: 60_000, max: 30}); // 30/min

// Config Management
router.use(limiter);
router.get('/getConfig', adminAuth, bootstrapGuard, getConfig);
router.post('/updateConfig', adminAuth, bootstrapGuard, updateConfig);
router.get('/configStatus', adminAuth, bootstrapGuard, configStatus);
router.post('/test/openai', adminAuth, bootstrapGuard, testOpenAI);
router.post('/test/mongodb', adminAuth, bootstrapGuard, testMongoDB);

module.exports = router;
