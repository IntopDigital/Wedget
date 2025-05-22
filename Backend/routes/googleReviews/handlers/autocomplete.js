const axios = require('axios');
const logger = require('../config/logger');
const { PLACES_API, GOOGLE_API_KEY } = require('../config/constants');

async function autocomplete(req, res) {
  const { input } = req.query;
  logger.info('Autocomplete request with input:', input);

  if (!input) {
    logger.error('Missing input parameter');
    return res.status(400).json({ error: 'Input query is required' });
  }
  try {
    const response = await axios.get(`${PLACES_API}/autocomplete/json`, {
      params: {
        input,
        key: GOOGLE_API_KEY,
      },
    });

    logger.info('Google API autocomplete response:', response.data.status);
    if (response.data.status !== 'OK') {
      logger.error('Google API autocomplete error:', response.data);
      return res.status(400).json({
        error: `Autocomplete failed: ${response.data.status}`,
        details: response.data.error_message || 'No additional details',
      });
    }

    res.json(response.data.predictions);
  } catch (error) {
    logger.error('Autocomplete error:', error.message, error.response?.data);
    res.status(500).json({
      error: 'Failed to fetch autocomplete suggestions',
      details: error.message,
    });
  }
}

module.exports = autocomplete;