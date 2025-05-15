const express = require('express');
const { loadClients } = require('./utils/clientManager');
const generateClient = require('./handlers/generateClient');
const autocomplete = require('./handlers/autocomplete');
const searchPlace = require('./handlers/searchPlace');
const reviews = require('./handlers/reviews');
const widget = require('./handlers/widget');
const placePhoto = require('./handlers/placePhoto');

const router = express.Router();

// Initialize clients
loadClients();

// Routes
router.post('/generate-client', generateClient);
router.get('/autocomplete', autocomplete);
router.get('/search-place', searchPlace);
router.get('/reviews', reviews);
router.get('/widget/:clientId.js', widget);
router.get('/place-photo', placePhoto);

module.exports = router;