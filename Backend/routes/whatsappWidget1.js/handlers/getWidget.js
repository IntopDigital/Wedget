const logger = require('../config/logger');
const { readWidgets } = require('../utils/fileUtils');
const { sanitizeInput } = require('../utils/sanitize');

async function getWidget(req, res) {
  try {
    const widgetId = sanitizeInput(req.params.widgetId);
    const widgets = await readWidgets();
    let widget = widgets.find((w) => w.widgetId === widgetId);
    if (!widget) {
      logger.warn(`Widget not found: ${widgetId}`);
      return res.status(404).json({ error: 'Widget not found' });
    }
    if (widget.greetingImage && !widget.greetingImage.startsWith('http')) {
      widget.greetingImage = `${process.env.BASE_URL}${widget.greetingImage}`;
    }
    logger.info(`Fetched widget: ${widgetId}`, { greetingImage: widget.greetingImage });
    res.status(200).json(widget);
  } catch (err) {
    logger.error('Error in /api/whatsapp/widgets/:widgetId:', err);
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
}

module.exports = getWidget;