const express = require('express');
const router = express.Router();
const { signupUser } = require('../../controllers/authController');

router.post('/', signupUser);

module.exports = router;
