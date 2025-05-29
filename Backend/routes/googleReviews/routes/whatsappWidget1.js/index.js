const express = require('express');
const { upload } = require('../whatsappWidget1.js/config/upload');
const createWidget = require('../whatsappWidget1.js/handlers/createWidget');
const getWidget = require('../whatsappWidget1.js/handlers/getWidget');
const serveWidgetScript = require('../whatsappWidget1.js/handlers/serveWidgetScript');
const logger = require('../whatsappWidget1.js/config/logger');

const router = express.Router();

// Routes
router.post('/widgets', upload.single('greetingImage'), createWidget);
router.get('/widgets/:widgetId', getWidget);
router.get('/widget.js', serveWidgetScript);

module.exports = router;