const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { PHONE_REGEX, DEFAULT_WELCOME_MESSAGE, DEFAULT_BUTTON_COLOR, DEFAULT_POSITION, DEFAULT_AGENT_NAME, DEFAULT_REPLY_TIME, DEFAULT_GREETING_MESSAGE } = require('../config/constants');
const { readWidgets, writeWidgets, deleteOldImage } = require('../utils/fileUtils');
const { sanitizeInput } = require('../utils/sanitize');

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
      file: req.file,
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

    const widgets = await readWidgets();
    let widget;

    if (sanitizedData.widgetId) {
      const index = widgets.findIndex((w) => w.widgetId === sanitizedData.widgetId);
      if (index === -1) {
        logger.warn(`Widget not found: ${sanitizedData.widgetId}`);
        return res.status(404).json({ error: 'Widget not found' });
      }
      const oldImage = widgets[index].greetingImage;
      widget = {
        ...widgets[index],
        phoneNumber: sanitizedData.phoneNumber,
        welcomeMessage: sanitizedData.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
        buttonColor: sanitizedData.buttonColor || DEFAULT_BUTTON_COLOR,
        position: sanitizedData.position || DEFAULT_POSITION,
        agentName: sanitizedData.agentName || DEFAULT_AGENT_NAME,
        replyTime: sanitizedData.replyTime || DEFAULT_REPLY_TIME,
        greetingMessage: sanitizedData.greetingMessage || DEFAULT_GREETING_MESSAGE,
        greetingImage: req.file
          ? `${process.env.BASE_URL}/Uploads/${req.file.filename}`
          : oldImage,
      };
      if (req.file && oldImage) {
        await deleteOldImage(oldImage);
      }
      widgets[index] = widget;
      logger.info(`Updated widget: ${widget.widgetId}`);
    } else {
      widget = {
        widgetId: uuidv4(),
        phoneNumber: sanitizedData.phoneNumber,
        welcomeMessage: sanitizedData.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
        buttonColor: sanitizedData.buttonColor || DEFAULT_BUTTON_COLOR,
        position: sanitizedData.position || DEFAULT_POSITION,
        agentName: sanitizedData.agentName || DEFAULT_AGENT_NAME,
        replyTime: sanitizedData.replyTime || DEFAULT_REPLY_TIME,
        greetingMessage: sanitizedData.greetingMessage || DEFAULT_GREETING_MESSAGE,
        greetingImage: req.file
          ? `${process.env.BASE_URL}/Uploads/${req.file.filename}`
          : null,
        createdAt: new Date().toISOString(),
      };
      widgets.push(widget);
      logger.info(`Created new widget: ${widget.widgetId}`);
    }

    await writeWidgets(widgets);

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