const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { saveClients, setClient } = require('../utils/clientManager');

async function generateClient(req, res) {
  const { placeId, placeName, themeColor = 'teal', widgetSize = 'medium' } = req.body;
  logger.info('Generate client request:', { placeId, placeName, themeColor, widgetSize });

  if (!placeId || !placeName) {
    logger.error('Missing placeId or placeName:', { placeId, placeName });
    return res.status(400).json({ error: 'placeId and placeName are required' });
  }

  const clientId = uuidv4();
  setClient(clientId, {
    placeId,
    placeName,
    themeColor,
    widgetSize,
  });

  await saveClients();

  const embedCode = `
    <div id="google-reviews" data-client-id="${clientId}" data-backend-url="${process.env.BASE_URL}"></div>
    <script src="${process.env.BASE_URL}/api/google/widget/${clientId}.js" async></script>
  `;

  logger.info('Generated client:', { clientId, placeId });
  res.json({ clientId, embedCode });
}

module.exports = generateClient;