const path = require('path');

module.exports = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyCwf0MQhK0cH7Yi4R2KkKSsJHLN7H5cr2A',
  PLACES_API: 'https://maps.googleapis.com/maps/api/place',
  CONFIG_FILE: path.join(__dirname, '../../Uploads/clientConfigs.json')
};