const logger = require('../config/logger');
const { sanitizeInput } = require('../utils/sanitize');
const Widget = require('../model/Widget');

async function getWidget(req, res) {
  try {
    const widgetId = sanitizeInput(req.params.widgetId);
    const widget = await Widget.findOne({ widgetId });

    if (!widget) {
      logger.warn(`Widget not found: ${widgetId}`);
      return res.status(404).json({ error: 'Widget not found' });
    }

    logger.info(`Fetched widget: ${widgetId}`, { greetingImage: widget.greetingImage });
    res.status(200).json(widget);
  } catch (err) {
    logger.error('Error in /api/whatsapp/widgets/:widgetId:', err);
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
}

module.exports = getWidget;