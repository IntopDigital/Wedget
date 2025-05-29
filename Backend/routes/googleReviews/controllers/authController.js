const Signup = require('../models/Signup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signupUser = async (req, res) => {
  try {
    console.log('Received payload:', req.body); // Debug log
    const { username, email, password, phone, companyname } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    const existingUser = await Signup.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new Signup({ username, email, password: hashpassword, phone, companyname });
    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `User with this ${field} already exists` });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    console.log('Login payload:', req.body); // Debug log
    const { email, password, phone } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "Email or phone and password are required" });
    }
    const user = await Signup.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        companyname: user.companyname,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};