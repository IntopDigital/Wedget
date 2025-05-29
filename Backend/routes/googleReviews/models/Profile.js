const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
