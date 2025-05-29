const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { PHONE_REGEX, DEFAULT_WELCOME_MESSAGE, DEFAULT_BUTTON_COLOR, DEFAULT_POSITION, DEFAULT_AGENT_NAME, DEFAULT_REPLY_TIME, DEFAULT_GREETING_MESSAGE } = require('../config/constants');
const { sanitizeInput } = require('../utils/sanitize');
const Widget = require('../model/Widget');

async function createWidget(req, res) {
  try {
    const {
      phoneNumber,
      welcomeMessage,
      buttonColor,
      position,
      widgetId,
      agentName,
      replyTime,
      greetingMessage,
    } = req.body;

    logger.info('Received /api/whatsapp/widgets request:', {
      body: req.body,
      file: req.file ? 'Image uploaded' : 'No image',
    });

    const sanitizedData = {
      phoneNumber: sanitizeInput(phoneNumber),
      welcomeMessage: sanitizeInput(welcomeMessage),
      buttonColor: sanitizeInput(buttonColor),
      position: sanitizeInput(position),
      widgetId: sanitizeInput(widgetId),
      agentName: sanitizeInput(agentName),
      replyTime: sanitizeInput(replyTime),
      greetingMessage: sanitizeInput(greetingMessage),
    };

    if (!PHONE_REGEX.test(sanitizedData.phoneNumber)) {
      logger.warn(`Invalid phone number format: ${sanitizedData.phoneNumber}`);
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    let widget;
    let greetingImage = null;

    // Convert uploaded image to Base64 if present
    if (req.file) {
      greetingImage = req.file.buffer.toString('base64');
      greetingImage = `data:${req.file.mimetype};base64,${greetingImage}`;
    }

    if (sanitizedData.widgetId) {
      // Update existing widget
      widget = await Widget.findOne({ widgetId: sanitizedData.widgetId });
      if (!widget) {
        logger.warn(`Widget not found: ${sanitizedData.widgetId}`);
        return res.status(404).json({ error: 'Widget not found' });
      }

      widget.phoneNumber = sanitizedData.phoneNumber;
      widget.welcomeMessage = sanitizedData.welcomeMessage || DEFAULT_WELCOME_MESSAGE;
      widget.buttonColor = sanitizedData.buttonColor || DEFAULT_BUTTON_COLOR;
      widget.position = sanitizedData.position || DEFAULT_POSITION;
      widget.agentName = sanitizedData.agentName || DEFAULT_AGENT_NAME;
      widget.replyTime = sanitizedData.replyTime || DEFAULT_REPLY_TIME;
      widget.greetingMessage = sanitizedData.greetingMessage?.trim() ? sanitizedData.greetingMessage.trim() : null;
      widget.greetingImage = greetingImage || widget.greetingImage;

      await widget.save();
      logger.info(`Updated widget: ${widget.widgetId}`);
    } else {
      // Create new widget
      widget = new Widget({
        widgetId: uuidv4(),
        phoneNumber: sanitizedData.phoneNumber,
        welcomeMessage: sanitizedData.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
        buttonColor: sanitizedData.buttonColor || DEFAULT_BUTTON_COLOR,
        position: sanitizedData.position || DEFAULT_POSITION,
        agentName: sanitizedData.agentName || DEFAULT_AGENT_NAME,
        replyTime: sanitizedData.replyTime || DEFAULT_REPLY_TIME,
        greetingMessage: sanitizedData.greetingMessage?.trim() ? sanitizedData.greetingMessage.trim() : null,
        greetingImage,
        createdAt: new Date(),
      });

      await widget.save();
      logger.info(`Created new widget: ${widget.widgetId}`);
    }

    res.status(200).json({
      widgetId: widget.widgetId,
      embedCode: `<div id="whatsapp-widget-${widget.widgetId}"></div>\n<script src="${process.env.BASE_URL}/api/whatsapp/widget.js?widgetId=${widget.widgetId}" defer></script>`,
    });
  } catch (err) {
    logger.error('Error in /api/whatsapp/widgets:', err);
    res.status(500).json({ error: 'Failed to save widget' });
  }
}

module.exports = createWidget;