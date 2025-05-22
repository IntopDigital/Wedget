const mongoose = require('mongoose');
const SignupSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  companyname: {
    type: String,
    required: false,
  },
});

const SignupModel = mongoose.model('Signup', SignupSchema);

module.exports = SignupModel;