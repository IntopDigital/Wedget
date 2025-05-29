const axios = require('axios');
const logger = require('../config/logger');
const cache = require('../config/cache');
const { PLACES_API, GOOGLE_API_KEY } = require('../config/constants');
const { getClients } = require('../utils/clientManager');

async function reviews(req, res) {
  const { clientId } = req.query;
  logger.info('Reviews request with clientId:', clientId);

  const config = getClients()[clientId];
  if (!config) {
    logger.error('Client ID not found:', clientId);
    return res.status(400).json({ error: 'Invalid client ID', details: 'Client ID not found in configurations' });
  }

  if (!config.placeId) {
    logger.error('Missing placeId for clientId:', clientId, 'config:', config);
    return res.status(400).json({ error: 'Missing place ID', details: `No placeId found for clientId: ${clientId}` });
  }

  const cacheKey = `reviews_${config.placeId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info('Returning cached reviews for placeId:', config.placeId);
    return res.json(cached);
  }

  try {
    logger.info('Fetching place details from Google API for placeId:', config.placeId);
    const response = await axios.get(`${PLACES_API}/details/json`, {
      params: {
        place_id: config.placeId,
        fields: 'name,rating,user_ratings_total,formatted_address,website,reviews,photos',
        key: GOOGLE_API_KEY,
      },
    });

    logger.info('Google API reviews response:', response.data.status);
    if (response.data.status !== 'OK') {
      logger.error('Google API reviews error:', response.data);
      return res.status(404).json({
        error: 'Place details not found',
        details: response.data.error_message || `Google API status: ${response.data.status}`,
      });
    }

    const data = {
      result: response.data.result,
      config: {
        themeColor: config.themeColor,
        widgetSize: config.widgetSize,
      },
    };

    cache.set(cacheKey, data);
    logger.info('Cached reviews for placeId:', config.placeId);
    res.json(data);
  } catch (error) {
    logger.error('Error fetching reviews:', error.message, error.response?.data);
    res.status(500).json({
      error: 'Failed to fetch place details',
      details: error.message,
    });
  }
}

module.exports = reviews;