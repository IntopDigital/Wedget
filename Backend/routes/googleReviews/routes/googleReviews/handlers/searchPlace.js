const axios = require('axios');
const logger = require('../config/logger');
const cache = require('../config/cache');
const { PLACES_API, GOOGLE_API_KEY } = require('../config/constants');

async function searchPlace(req, res) {
  const { query } = req.query;
  logger.info('Search place request with query:', query);
  if (!query) {
    logger.error('Missing query parameter');
    return res.status(400).json({ error: 'Query is required' });
  }
  try{
    let placeId = query;
    if (!query.startsWith('place_id:')) {
      const findResponse = await axios.get(`${PLACES_API}/findplacefromtext/json`, {
        params: {
          input: query,
          inputtype: 'textquery',
          fields: 'place_id',
          key: GOOGLE_API_KEY,
        },
      });
      logger.info('Find place response:', findResponse.data.status);
      if (findResponse.data.status !== 'OK' || !findResponse.data.candidates.length) {
        logger.error('Place not found for query:', query);
        return res.status(404).json({ error: 'Place not found' });
      }
      placeId = findResponse.data.candidates[0].place_id;
    } else {
      placeId = query.replace('place_id:', '');
    }
    const cacheKey = `place_${placeId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached place data:', cacheKey);
      return res.json(cached);
    }
    const response = await axios.get(`${PLACES_API}/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,formatted_address,website,reviews,photos',
        key: GOOGLE_API_KEY,
      },
    });  
    logger.info('Place details response:', response.data.status);
    if (response.data.status !== 'OK') {
      logger.error('Place details not found:', response.data);
      return res.status(404).json({ error: 'Place details not found' });
    }
    const data = { result: response.data.result };
    cache.set(cacheKey, data);
    logger.info('Cached place data:', cacheKey);
    res.json(data);
  } catch (error) {
    logger.error('Search place error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to fetch place details', details: error.message });
  }
}
module.exports = searchPlace;