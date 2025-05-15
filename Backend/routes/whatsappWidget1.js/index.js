const express = require('express');
const { upload } = require('./config/storage');
const { ensureUploadsDir, initializeJsonFile } = require('./utils/fileUtils');
const createWidget = require('./handlers/createWidget');
const getWidget = require('./handlers/getWidget');
const serveWidgetScript = require('./handlers/serveWidgetScript');
const logger = require('./config/logger');

const router = express.Router();
// Initialize directories and files
Promise.all([ensureUploadsDir(), initializeJsonFile()]).catch((err) => {
  logger.error('Initialization error:', err);
  process.exit(1);
});

// Routes
router.post('/widgets', upload.single('greetingImage'), createWidget);
router.get('/widgets/:widgetId', getWidget);
router.get('/widget.js', serveWidgetScript);

module.exports = router;