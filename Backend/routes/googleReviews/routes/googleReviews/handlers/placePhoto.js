const axios = require('axios');
const logger = require('../config/logger');
const { PLACES_API, GOOGLE_API_KEY } = require('../config/constants');

async function placePhoto(req, res) {
  const { photo_reference, maxwidth } = req.query;
  logger.info('Place photo request:', { photo_reference, maxwidth });

  if (!photo_reference) {
    logger.error('Missing photo_reference parameter');
    return res.status(400).json({ error: 'Photo reference is required' });
  }

  try {
    const response = await axios.get(`${PLACES_API}/photo`, {
      params: {
        photo_reference,
        maxwidth: maxwidth || 800,
        key: GOOGLE_API_KEY,
      },
      responseType: 'arraybuffer',
    });

    logger.info('Fetched place photo successfully');
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    logger.error('Photo fetch error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch place photo', details: error.message });
  }
}

module.exports = placePhoto;